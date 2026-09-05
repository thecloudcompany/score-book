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
  getTableTennisMatches,
  getTableTennisGames,
  updateTableTennisGame,
  updateTableTennisMatchStatus,
  getParticipants,
  updateTournamentStatus,
  updateBadmintonMatchParticipant,
  updateTennisMatchParticipant,
  updateTableTennisMatchParticipant,
} from '@/lib/db-operations';
import { badmintonSport } from '@/lib/sports/badminton';
import { tennisSport } from '@/lib/sports/tennis';
import { tableTennisSport } from '@/lib/sports/table-tennis';
import type { BadmintonMatch, BadmintonGame, TennisMatch, TennisSet, TableTennisMatch, TableTennisGame, MatchStatus, TournamentType } from '@/types';

export function useMatches(tournamentId: number, sport: 'badminton' | 'tennis' | 'table_tennis', tournamentType: TournamentType = 'round_robin') {
  const [matches, setMatches] = useState<(BadmintonMatch | TennisMatch | TableTennisMatch)[]>([]);
  const [units, setUnits] = useState<Record<number, BadmintonGame[] | TennisSet[] | TableTennisGame[]>>({});
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
    } else if (sport === 'tennis') {
      const matchList = getTennisMatches(tournamentId);
      setMatches(matchList);

      const unitsMap: Record<number, TennisSet[]> = {};
      for (const match of matchList) {
        unitsMap[match.id] = getTennisSets(match.id);
      }
      setUnits(unitsMap);
    } else {
      const matchList = getTableTennisMatches(tournamentId);
      setMatches(matchList);

      const unitsMap: Record<number, TableTennisGame[]> = {};
      for (const match of matchList) {
        unitsMap[match.id] = getTableTennisGames(match.id);
      }
      setUnits(unitsMap);
    }
  }, [tournamentId, sport]);

  const updateScore = useCallback(
    (matchId: number, unitNumber: number, scoreA: number | null, scoreB: number | null) => {
      if (sport === 'badminton') {
        updateBadmintonGame(matchId, unitNumber, scoreA, scoreB);
      } else if (sport === 'tennis') {
        updateTennisSet(matchId, unitNumber, scoreA, scoreB);
      } else {
        updateTableTennisGame(matchId, unitNumber, scoreA, scoreB);
      }

      // Read the updated units once instead of mirroring state by hand.
      const freshUnits: any[] =
        sport === 'badminton' ? getBadmintonGames(matchId)
        : sport === 'tennis' ? getTennisSets(matchId)
        : getTableTennisGames(matchId);
      setUnits((prev) => ({ ...prev, [matchId]: freshUnits as any }));

      // Recalculate match state
      const currentMatch = matches.find((m) => m.id === matchId);
      if (!currentMatch) { refresh(); return; }
      const prevWinnerId = currentMatch.winnerId ?? null;

      const currentUnits = freshUnits;
      const filledUnits = currentUnits.filter((u: any) => {
        const a = sport === 'badminton' || sport === 'table_tennis' ? u.scoreA : u.gamesA;
        const b = sport === 'badminton' || sport === 'table_tennis' ? u.scoreB : u.gamesB;
        return a !== null && b !== null;
      });

      const hasAnyScore = filledUnits.length > 0;
      let matchFormat: Record<string, number>;
      if (sport === 'badminton') {
        matchFormat = {
          gamePoint: (currentMatch as BadmintonMatch).gamePoint,
          bestOfGames: (currentMatch as BadmintonMatch).bestOfGames,
        };
      } else if (sport === 'table_tennis') {
        matchFormat = {
          gamePoint: (currentMatch as TableTennisMatch).gamePoint,
          bestOfGames: (currentMatch as TableTennisMatch).bestOfGames,
        };
      } else {
        matchFormat = {
          setsToWin: (currentMatch as TennisMatch).setsToWin,
          gamesToWinPerSet: (currentMatch as TennisMatch).gamesToWinPerSet,
        };
      }

      const scoringUnitsForCheck = filledUnits.map((u: any) => ({
        unitNumber: u.gameNumber || u.setNumber,
        scoreA: sport === 'badminton' || sport === 'table_tennis' ? u.scoreA : u.gamesA,
        scoreB: sport === 'badminton' || sport === 'table_tennis' ? u.scoreB : u.gamesB,
      }));

      const sportModule =
        sport === 'badminton' ? badmintonSport : sport === 'tennis' ? tennisSport : tableTennisSport;
      const isComplete = sportModule.isMatchComplete(scoringUnitsForCheck, matchFormat);
      const winner = isComplete
        ? sportModule.determineWinner(scoringUnitsForCheck, matchFormat)
        : null;

      let newStatus: MatchStatus = 'upcoming';
      if (isComplete) {
        newStatus = 'completed';
      } else if (hasAnyScore) {
        newStatus = 'in_progress';
      }

      let winnerId: number | null = null;
      if (isComplete) {
        winnerId = winner === 'a' ? currentMatch.participantAId : winner === 'b' ? currentMatch.participantBId : null;
      }

      if (sport === 'badminton') {
        updateBadmintonMatchStatus(matchId, newStatus, winnerId);
      } else if (sport === 'tennis') {
        updateTennisMatchStatus(matchId, newStatus, winnerId);
      } else {
        updateTableTennisMatchStatus(matchId, newStatus, winnerId);
      }

      // Handle knockout progression — advance on completion, retract when the
      // upstream winner changes (including to no winner).
      if (tournamentType === 'knockout') {
        const feedsIntoMatchId = currentMatch.feedsIntoMatchId;
        const feedsIntoSlot = currentMatch.feedsIntoSlot;

        if (feedsIntoMatchId && feedsIntoSlot) {
          const downstream = matches.find((m) => m.id === feedsIntoMatchId);
          // Never rewrite a finished downstream match; it stays locked instead.
          if (downstream && downstream.status !== 'completed') {
            const slotValue = feedsIntoSlot === 'A' ? downstream.participantAId : downstream.participantBId;
            if (isComplete && winnerId !== null) {
              if (slotValue !== winnerId) {
                if (sport === 'badminton') {
                  updateBadmintonMatchParticipant(feedsIntoMatchId, feedsIntoSlot, winnerId);
                } else if (sport === 'tennis') {
                  updateTennisMatchParticipant(feedsIntoMatchId, feedsIntoSlot, winnerId);
                } else {
                  updateTableTennisMatchParticipant(feedsIntoMatchId, feedsIntoSlot, winnerId);
                }
              }
            } else if (prevWinnerId !== null && slotValue === prevWinnerId) {
              if (sport === 'badminton') {
                updateBadmintonMatchParticipant(feedsIntoMatchId, feedsIntoSlot, null);
              } else if (sport === 'tennis') {
                updateTennisMatchParticipant(feedsIntoMatchId, feedsIntoSlot, null);
              } else {
                updateTableTennisMatchParticipant(feedsIntoMatchId, feedsIntoSlot, null);
              }
            }
          }
        }
      }

      // Update tournament status if needed
      if (newStatus !== 'upcoming') {
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
    [matches, sport, tournamentId, tournamentType, refresh]
  );

  return { matches, units, participants, refresh, updateScore };
}
