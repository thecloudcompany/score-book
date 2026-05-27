import type { LeaderboardEntry, Participant, BadmintonMatch, BadmintonGame, TennisMatch, TennisSet } from '@/types';

interface MatchWithUnits {
  match: BadmintonMatch | TennisMatch;
  units: { scoreA: number | null; scoreB: number | null }[];
}

function calculateStats(
  matches: MatchWithUnits[],
  participants: Participant[],
  sport: 'badminton' | 'tennis'
): LeaderboardEntry[] {
  const stats: Record<number, { wins: number; losses: number; pointDiff: number; gameDiff: number }> = {};

  for (const p of participants) {
    stats[p.id] = { wins: 0, losses: 0, pointDiff: 0, gameDiff: 0 };
  }

  for (const { match, units } of matches) {
    if (match.status !== 'completed') continue;

    const a = match.participantAId;
    const b = match.participantBId;
    const winner = match.winnerId;

    if (winner === a) {
      stats[a].wins++;
      stats[b].losses++;
    } else if (winner === b) {
      stats[b].wins++;
      stats[a].losses++;
    }

    for (const unit of units) {
      if (unit.scoreA === null || unit.scoreB === null) continue;

      stats[a].pointDiff += unit.scoreA - unit.scoreB;
      stats[b].pointDiff += unit.scoreB - unit.scoreA;

      if (unit.scoreA > unit.scoreB) {
        stats[a].gameDiff++;
        stats[b].gameDiff--;
      } else {
        stats[b].gameDiff++;
        stats[a].gameDiff--;
      }
    }
  }

  // Sort based on sport-specific tie-breakers
  const sorted = participants
    .map((p) => ({
      participantId: p.id,
      name: p.name,
      ...stats[p.id],
      rank: 0,
      tiedWith: [] as number[],
    }))
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
      if (b.gameDiff !== a.gameDiff) return b.gameDiff - a.gameDiff;
      return a.name.localeCompare(b.name);
    });

  // Competition ranking (1224 style) + tie detection
  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (
      i > 0 &&
      sorted[i].wins === sorted[i - 1].wins &&
      sorted[i].pointDiff === sorted[i - 1].pointDiff &&
      sorted[i].gameDiff === sorted[i - 1].gameDiff
    ) {
      sorted[i].rank = sorted[i - 1].rank;
      sorted[i].tiedWith.push(sorted[i - 1].participantId);
      sorted[i - 1].tiedWith.push(sorted[i].participantId);
      currentRank++;
    } else {
      sorted[i].rank = currentRank;
      currentRank++;
    }
  }

  return sorted;
}

export function calculateBadmintonLeaderboard(
  matches: BadmintonMatch[],
  games: BadmintonGame[],
  participants: Participant[]
): LeaderboardEntry[] {
  const matchUnits = matches.map((match) => ({
    match,
    units: games
      .filter((g) => g.matchId === match.id)
      .sort((a, b) => a.gameNumber - b.gameNumber)
      .map((g) => ({ scoreA: g.scoreA, scoreB: g.scoreB })),
  }));

  return calculateStats(matchUnits, participants, 'badminton');
}

export function calculateTennisLeaderboard(
  matches: TennisMatch[],
  sets: TennisSet[],
  participants: Participant[]
): LeaderboardEntry[] {
  const matchUnits = matches.map((match) => ({
    match,
    units: sets
      .filter((s) => s.matchId === match.id)
      .sort((a, b) => a.setNumber - b.setNumber)
      .map((s) => ({ scoreA: s.gamesA, scoreB: s.gamesB })),
  }));

  return calculateStats(matchUnits, participants, 'tennis');
}
