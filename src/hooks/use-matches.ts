import { useState, useCallback } from 'react';
import {
  getBadmintonMatches,
  getBadmintonGames,
  updateBadmintonGame,
  updateBadmintonMatchStatus,
  getTennisMatches,
  getTennisSets,
  updateTennisSet,
  updateTennisMatchStatus,
  getParticipants,
  updateTournamentStatus,
} from '@/lib/db-operations';
import { badmintonSport } from '@/lib/sports/badminton';
import { tennisSport } from '@/lib/sports/tennis';
import type { BadmintonMatch, BadmintonGame, TennisMatch, TennisSet, MatchStatus } from '@/types';

export function useMatches(tournamentId: number, sport: 'badminton' | 'tennis') {
  const [matches, setMatches] = useState<(BadmintonMatch | TennisMatch)[]>([]);
  const [units, setUnits] = useState<Record<number, BadmintonGame[] | TennisSet[]>>({});
  const [participants, setParticipants] = useState<{ id: number; name: string }[]>([]);

  const refresh = useCallback(() => {
    const participantList = getParticipants(tournamentId);
    setParticipants(participantList.map((p) => ({ id: p.id, name: p.name })));

    if (sport === 'badminton') {
      const matchList = getBadmintonMatches(tournamentId);
      setMatches(matchList);

      const unitsMap: Record<number, BadmintonGame[]> = {};
      for (const match of matchList) {
        unitsMap[match.id] = getBadmintonGames(match.id);
      }
      setUnits(unitsMap);
    } else {
      const matchList = getTennisMatches(tournamentId);
      setMatches(matchList);

      const unitsMap: Record<number, TennisSet[]> = {};
      for (const match of matchList) {
        unitsMap[match.id] = getTennisSets(match.id);
      }
      setUnits(unitsMap);
    }
  }, [tournamentId, sport]);

  const updateScore = useCallback(
    (matchId: number, unitNumber: number, scoreA: number | null, scoreB: number | null) => {
      if (sport === 'badminton') {
        updateBadmintonGame(matchId, unitNumber, scoreA, scoreB);
      } else {
        updateTennisSet(matchId, unitNumber, scoreA, scoreB);
      }

      // Check if match should auto-complete
      const matchUnits = units[matchId] || [];
      const scoringUnits = matchUnits.map((u: any) => ({
        unitNumber: u.gameNumber || u.setNumber,
        scoreA: u.scoreA ?? u.gamesA,
        scoreB: u.scoreB ?? u.gamesB,
      }));

      // Update the local unit first
      const updatedUnits = { ...units };
      const unitList = [...(updatedUnits[matchId] || [])];
      const unitIndex = unitList.findIndex((u: any) =>
        (u.gameNumber || u.setNumber) === unitNumber
      );
      if (unitIndex >= 0) {
        const updatedUnit = { ...unitList[unitIndex] };
        if (sport === 'badminton') {
          (updatedUnit as BadmintonGame).scoreA = scoreA;
          (updatedUnit as BadmintonGame).scoreB = scoreB;
        } else {
          (updatedUnit as TennisSet).gamesA = scoreA;
          (updatedUnit as TennisSet).gamesB = scoreB;
        }
        unitList[unitIndex] = updatedUnit;
        (updatedUnits as any)[matchId] = unitList;
        setUnits(updatedUnits);
      }

      // Recalculate match state
      const currentMatch = matches.find((m) => m.id === matchId);
      if (!currentMatch) return;

      const currentUnits = updatedUnits[matchId] || [];
      const filledUnits = currentUnits.filter((u: any) => {
        const a = sport === 'badminton' ? u.scoreA : u.gamesA;
        const b = sport === 'badminton' ? u.scoreB : u.gamesB;
        return a !== null && b !== null;
      });

      const hasAnyScore = filledUnits.length > 0;
      const matchFormat: Record<string, number> =
        sport === 'badminton'
          ? {
              gamePoint: (currentMatch as BadmintonMatch).gamePoint,
              bestOfGames: (currentMatch as BadmintonMatch).bestOfGames,
            }
          : {
              setsToWin: (currentMatch as TennisMatch).setsToWin,
              gamesToWinPerSet: (currentMatch as TennisMatch).gamesToWinPerSet,
            };

      const scoringUnitsForCheck = filledUnits.map((u: any) => ({
        unitNumber: u.gameNumber || u.setNumber,
        scoreA: sport === 'badminton' ? u.scoreA : u.gamesA,
        scoreB: sport === 'badminton' ? u.scoreB : u.gamesB,
      }));

      const sportModule = sport === 'badminton' ? badmintonSport : tennisSport;
      const isComplete = sportModule.isMatchComplete(scoringUnitsForCheck, matchFormat);
      const winner = isComplete
        ? sportModule.determineWinner(scoringUnitsForCheck, matchFormat)
        : null;

      let newStatus: MatchStatus = currentMatch.status;
      if (isComplete) {
        newStatus = 'completed';
      } else if (hasAnyScore && currentMatch.status === 'upcoming') {
        newStatus = 'in_progress';
      }

      // If match was already completed but edit makes it invalid, keep old winner
      let winnerId: number | null = null;
      if (isComplete) {
        winnerId = winner === 'a' ? currentMatch.participantAId : winner === 'b' ? currentMatch.participantBId : null;
      } else if (currentMatch.status === 'completed') {
        winnerId = currentMatch.winnerId;
      }

      if (sport === 'badminton') {
        updateBadmintonMatchStatus(matchId, newStatus, winnerId);
      } else {
        updateTennisMatchStatus(matchId, newStatus, winnerId);
      }

      // Update tournament status if needed
      if (currentMatch.status === 'upcoming' && newStatus !== 'upcoming') {
        updateTournamentStatus(tournamentId, 'active');
      }

      // Check if all matches are completed — if so, mark tournament as completed
      const allMatchStatuses = matches.map((m) =>
        m.id === matchId ? newStatus : m.status
      );
      const allCompleted = allMatchStatuses.every((s) => s === 'completed');
      if (allCompleted && matches.length > 0) {
        updateTournamentStatus(tournamentId, 'completed');
      }

      refresh();
    },
    [matches, units, sport, tournamentId, refresh]
  );

  return { matches, units, participants, refresh, updateScore };
}
