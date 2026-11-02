import { truncateAfterClinch } from './leaderboard';
import { tieKey } from './rng';

interface PoolGame {
  scoreA: number | null;
  scoreB: number | null;
}

export interface PoolMatch {
  participantAId: number | null;
  participantBId: number | null;
  winnerId: number | null;
  status: 'upcoming' | 'in_progress' | 'completed';
  winsNeeded: number;
  games: PoolGame[];
}

export interface PoolStandingRow {
  participantId: number;
  rank: number;
  played: number;
  wins: number;
  losses: number;
  pointDiff: number;
  gameDiff: number;
  winRate: number;
  pointDiffPerMatch: number;
  tieKey: number;
}

interface Totals {
  played: number;
  wins: number;
  losses: number;
  pointDiff: number;
  gameDiff: number;
}

function matchDiff(match: PoolMatch): { pointDiff: number; gameDiff: number } {
  let pointDiff = 0;
  let gameDiff = 0;
  for (const game of truncateAfterClinch(match.games, match.winsNeeded)) {
    if (game.scoreA === null || game.scoreB === null) continue;
    pointDiff += game.scoreA - game.scoreB;
    if (game.scoreA > game.scoreB) gameDiff++;
    else if (game.scoreA < game.scoreB) gameDiff--;
  }
  return { pointDiff, gameDiff };
}

function isDecided(match: PoolMatch): boolean {
  return (
    match.status === 'completed' &&
    match.participantAId !== null &&
    match.participantBId !== null &&
    match.winnerId !== null
  );
}

// Head-to-head among players level on wins: only their matches against each other.
function headToHead(
  ids: number[],
  completed: PoolMatch[]
): Map<number, { wins: number; pointDiff: number }> {
  const members = new Set(ids);
  const mini = new Map<number, { wins: number; pointDiff: number }>(
    ids.map((id) => [id, { wins: 0, pointDiff: 0 }])
  );
  for (const match of completed) {
    const a = match.participantAId;
    const b = match.participantBId;
    if (a === null || b === null || !members.has(a) || !members.has(b)) continue;
    const winner = mini.get(match.winnerId!);
    if (!winner) continue;
    winner.wins++;
    const { pointDiff } = matchDiff(match);
    mini.get(a)!.pointDiff += pointDiff;
    mini.get(b)!.pointDiff -= pointDiff;
  }
  return mini;
}

// Ranking: wins → head-to-head (wins, then point diff) → overall point diff
// → overall game diff → stable seeded order. Every pool gets a strict order.
export function computePoolStandings(
  participantIds: number[],
  matches: PoolMatch[],
  seed: number
): PoolStandingRow[] {
  const totals = new Map<number, Totals>(
    participantIds.map((id) => [id, { played: 0, wins: 0, losses: 0, pointDiff: 0, gameDiff: 0 }] as const)
  );
  const completed = matches.filter(isDecided);

  for (const match of completed) {
    const a = totals.get(match.participantAId!);
    const b = totals.get(match.participantBId!);
    if (!a || !b) continue;
    if (match.winnerId === match.participantAId) {
      a.wins++;
      b.losses++;
    } else if (match.winnerId === match.participantBId) {
      b.wins++;
      a.losses++;
    } else {
      continue;
    }
    a.played++;
    b.played++;
    const { pointDiff, gameDiff } = matchDiff(match);
    a.pointDiff += pointDiff;
    b.pointDiff -= pointDiff;
    a.gameDiff += gameDiff;
    b.gameDiff -= gameDiff;
  }

  const idsByWins = new Map<number, number[]>();
  for (const id of participantIds) {
    const wins = totals.get(id)!.wins;
    idsByWins.set(wins, [...(idsByWins.get(wins) ?? []), id]);
  }
  const miniByPlayer = new Map<number, { wins: number; pointDiff: number }>();
  for (const ids of idsByWins.values()) {
    if (ids.length < 2) continue;
    for (const [id, mini] of headToHead(ids, completed)) miniByPlayer.set(id, mini);
  }

  const ordered = participantIds
    .map((id) => {
      const t = totals.get(id)!;
      return {
        participantId: id,
        ...t,
        winRate: t.played > 0 ? t.wins / t.played : 0,
        pointDiffPerMatch: t.played > 0 ? t.pointDiff / t.played : 0,
        tieKey: tieKey(seed, id),
      };
    })
    .sort((x, y) => {
      if (x.wins !== y.wins) return y.wins - x.wins;
      const mx = miniByPlayer.get(x.participantId) ?? { wins: 0, pointDiff: 0 };
      const my = miniByPlayer.get(y.participantId) ?? { wins: 0, pointDiff: 0 };
      return (
        my.wins - mx.wins ||
        my.pointDiff - mx.pointDiff ||
        y.pointDiff - x.pointDiff ||
        y.gameDiff - x.gameDiff ||
        y.tieKey - x.tieKey
      );
    });

  return ordered.map((row, index) => ({ ...row, rank: index + 1 }));
}
