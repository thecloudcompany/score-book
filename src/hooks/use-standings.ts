import { useState, useCallback } from 'react';
import {
  getParticipants,
  getBadmintonMatches,
  getBadmintonGames,
  getTennisMatches,
  getTennisSets,
  getTableTennisMatches,
  getTableTennisGames,
} from '@/lib/db-operations';
import { calculateBadmintonLeaderboard, calculateTennisLeaderboard, calculateTableTennisLeaderboard } from '@/lib/leaderboard';
import type { LeaderboardEntry } from '@/types';

export function useStandings(tournamentId: number, sport: 'badminton' | 'tennis' | 'table_tennis') {
  const [standings, setStandings] = useState<LeaderboardEntry[]>([]);

  const refresh = useCallback(() => {
    const participants = getParticipants(tournamentId);

    if (sport === 'badminton') {
      const matches = getBadmintonMatches(tournamentId);
      const allGames: any[] = [];
      for (const match of matches) {
        allGames.push(...getBadmintonGames(match.id));
      }
      const result = calculateBadmintonLeaderboard(matches, allGames, participants);
      setStandings(result);
    } else if (sport === 'tennis') {
      const matches = getTennisMatches(tournamentId);
      const allSets: any[] = [];
      for (const match of matches) {
        allSets.push(...getTennisSets(match.id));
      }
      const result = calculateTennisLeaderboard(matches, allSets, participants);
      setStandings(result);
    } else {
      const matches = getTableTennisMatches(tournamentId);
      const allGames: any[] = [];
      for (const match of matches) {
        allGames.push(...getTableTennisGames(match.id));
      }
      const result = calculateTableTennisLeaderboard(matches, allGames, participants);
      setStandings(result);
    }
  }, [tournamentId, sport]);

  return { standings, refresh };
}
