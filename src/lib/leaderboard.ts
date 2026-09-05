import type { LeaderboardEntry, Participant, BadmintonMatch, BadmintonGame, TennisMatch, TennisSet, TableTennisMatch, TableTennisGame } from '@/types';

interface MatchWithUnits {
  match: BadmintonMatch | TennisMatch;
  units: { scoreA: number | null; scoreB: number | null }[];
  winsNeeded: number;
}

// Only units up to and including the clincher count — scores saved after a
// match was already decided are ignored instead of corrupting differentials.
function truncateAfterClinch(
  units: { scoreA: number | null; scoreB: number | null }[],
  winsNeeded: number
): { scoreA: number | null; scoreB: number | null }[] {
  let aWins = 0;
  let bWins = 0;
  const kept: { scoreA: number | null; scoreB: number | null }[] = [];
  for (const unit of units) {
    kept.push(unit);
    if (unit.scoreA !== null && unit.scoreB !== null) {
      if (unit.scoreA > unit.scoreB) aWins++;
      else if (unit.scoreB > unit.scoreA) bWins++;
      if (aWins >= winsNeeded || bWins >= winsNeeded) break;
    }
  }
  return kept;
}

function calculateStats(
  matches: MatchWithUnits[],
  participants: Participant[]
): LeaderboardEntry[] {
  const stats: Record<number, { wins: number; losses: number; pointDiff: number; gameDiff: number }> = {};

  for (const p of participants) {
    stats[p.id] = { wins: 0, losses: 0, pointDiff: 0, gameDiff: 0 };
  }

  for (const { match, units, winsNeeded } of matches) {
    if (match.status !== 'completed') continue;

    const a = match.participantAId;
    const b = match.participantBId;
    const winner = match.winnerId;

    // Skip bye/TBD matches (unfilled knockout slots)
    if (a === null || b === null) continue;

    if (winner === a) {
      stats[a].wins++;
      stats[b].losses++;
    } else if (winner === b) {
      stats[b].wins++;
      stats[a].losses++;
    }

    for (const unit of truncateAfterClinch(units, winsNeeded)) {
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
    winsNeeded: Math.ceil((match.bestOfGames ?? 3) / 2),
    units: games
      .filter((g) => g.matchId === match.id)
      .sort((a, b) => a.gameNumber - b.gameNumber)
      .map((g) => ({ scoreA: g.scoreA, scoreB: g.scoreB })),
  }));

  return calculateStats(matchUnits, participants);
}

export function calculateTennisLeaderboard(
  matches: TennisMatch[],
  sets: TennisSet[],
  participants: Participant[]
): LeaderboardEntry[] {
  const matchUnits = matches.map((match) => ({
    match,
    winsNeeded: match.setsToWin,
    units: sets
      .filter((s) => s.matchId === match.id)
      .sort((a, b) => a.setNumber - b.setNumber)
      .map((s) => ({ scoreA: s.gamesA, scoreB: s.gamesB })),
  }));

  return calculateStats(matchUnits, participants);
}

export function calculateTableTennisLeaderboard(
  matches: TableTennisMatch[],
  games: TableTennisGame[],
  participants: Participant[]
): LeaderboardEntry[] {
  const matchUnits = matches.map((match) => ({
    match,
    winsNeeded: Math.ceil((match.bestOfGames ?? 3) / 2),
    units: games
      .filter((g) => g.matchId === match.id)
      .sort((a, b) => a.gameNumber - b.gameNumber)
      .map((g) => ({ scoreA: g.scoreA, scoreB: g.scoreB })),
  }));

  return calculateStats(matchUnits, participants);
}
