import { useState, useCallback } from 'react';
import {
  getTournaments,
  createTournament as dbCreateTournament,
  deleteTournament as dbDeleteTournament,
  updateTournamentName,
} from '@/lib/db-operations';
import { getParticipants, createParticipant } from '@/lib/db-operations';
import { generateRoundRobin } from '@/lib/scheduler';
import { badmintonSport } from '@/lib/sports/badminton';
import { tennisSport } from '@/lib/sports/tennis';
import {
  createBadmintonMatch,
  createTennisMatch,
} from '@/lib/db-operations';
import type { Tournament, SportType } from '@/types';

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    const data = getTournaments();
    setTournaments(data);
    setLoading(false);
  }, []);

  const createTournament = useCallback(
    (
      name: string,
      sport: SportType,
      participantNames: string[],
      format: Record<string, number>
    ) => {
      const tournament = dbCreateTournament(name, sport);

      // Create participants
      const participants: { id: number; name: string }[] = [];
      for (const name of participantNames) {
        const p = createParticipant(tournament.id, name);
        participants.push({ id: p.id, name: p.name });
      }

      // Generate round-robin pairings
      const participantIds = participants.map((p) => p.id);
      const pairings = generateRoundRobin(participantIds);

      // Create matches
      for (const [aId, bId] of pairings) {
        if (sport === 'badminton') {
          createBadmintonMatch(
            tournament.id,
            aId,
            bId,
            format.gamePoint ?? badmintonSport.defaultFormat.gamePoint,
            format.bestOfGames ?? badmintonSport.defaultFormat.bestOfGames
          );
        } else {
          createTennisMatch(
            tournament.id,
            aId,
            bId,
            format.setsToWin ?? tennisSport.defaultFormat.setsToWin,
            format.gamesToWinPerSet ?? tennisSport.defaultFormat.gamesToWinPerSet
          );
        }
      }

      refresh();
      return tournament;
    },
    [refresh]
  );

  const deleteTournament = useCallback(
    (id: number) => {
      dbDeleteTournament(id);
      refresh();
    },
    [refresh]
  );

  const renameTournament = useCallback(
    (id: number, name: string) => {
      updateTournamentName(id, name);
      refresh();
    },
    [refresh]
  );

  return {
    tournaments,
    loading,
    refresh,
    createTournament,
    deleteTournament,
    renameTournament,
  };
}
