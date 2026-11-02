import { useState, useCallback } from 'react';
import {
  getParticipants,
  getQualifiers,
  getBadmintonMatches,
  getBadmintonGames,
  getTennisMatches,
  getTennisSets,
  getTableTennisMatches,
  getTableTennisGames,
  getPickleballMatches,
  getPickleballGames,
} from '@/lib/db-operations';
import { calculateBadmintonLeaderboard, calculateTennisLeaderboard, calculateTableTennisLeaderboard, calculatePickleballLeaderboard } from '@/lib/leaderboard';
import { getPoolViews, type PoolView } from '@/lib/pool-operations';
import type { LeaderboardEntry, QualifierRecord, SportType } from '@/types';

export function useStandings(tournamentId: number, sport: SportType) {
  const [standings, setStandings] = useState<LeaderboardEntry[]>([]);
  const [poolViews, setPoolViews] = useState<PoolView[]>([]);
  const [qualifiers, setQualifiers] = useState<QualifierRecord[]>([]);

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
      setPoolViews(getPoolViews(tournamentId));
      setQualifiers(getQualifiers(tournamentId));
    } else if (sport === 'tennis') {
      const matches = getTennisMatches(tournamentId);
      const allSets: any[] = [];
      for (const match of matches) {
        allSets.push(...getTennisSets(match.id));
      }
      const result = calculateTennisLeaderboard(matches, allSets, participants);
      setStandings(result);
    } else if (sport === 'table_tennis') {
      const matches = getTableTennisMatches(tournamentId);
      const allGames: any[] = [];
      for (const match of matches) {
        allGames.push(...getTableTennisGames(match.id));
      }
      const result = calculateTableTennisLeaderboard(matches, allGames, participants);
      setStandings(result);
    } else {
      const matches = getPickleballMatches(tournamentId);
      const allGames: any[] = [];
      for (const match of matches) {
        allGames.push(...getPickleballGames(match.id));
      }
      const result = calculatePickleballLeaderboard(matches, allGames, participants);
      setStandings(result);
    }
  }, [tournamentId, sport]);

  return { standings, poolViews, qualifiers, refresh };
}
