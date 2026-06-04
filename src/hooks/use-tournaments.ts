import { useState, useCallback } from 'react';
import {
  getTournaments,
  createTournament as dbCreateTournament,
  deleteTournament as dbDeleteTournament,
  updateTournamentName,
  createParticipant,
  createBadmintonMatch,
  createTennisMatch,
  updateBadmintonMatchBracketLink,
  updateTennisMatchBracketLink,
  updateBadmintonMatchStatus,
  updateTennisMatchStatus,
  updateBadmintonMatchParticipant,
  updateTennisMatchParticipant,
} from '@/lib/db-operations';
import { generateRoundRobin } from '@/lib/scheduler';
import { generateKnockoutBracket } from '@/lib/bracket-generator';
import { badmintonSport } from '@/lib/sports/badminton';
import { tennisSport } from '@/lib/sports/tennis';
import type { Tournament, SportType, TournamentType, ByeConfig } from '@/types';

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
      tournamentType: TournamentType,
      participantNames: string[],
      format: Record<string, number>,
      byeConfig?: ByeConfig
    ) => {
      const tournament = dbCreateTournament(name, sport, tournamentType);

      // Create participants
      const participants: { id: number; name: string }[] = [];
      for (const name of participantNames) {
        const p = createParticipant(tournament.id, name);
        participants.push({ id: p.id, name: p.name });
      }

      const participantIds = participants.map((p) => p.id);

      if (tournamentType === 'round_robin') {
        // Generate round-robin pairings
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
      } else {
        // Generate knockout bracket
        // Convert bye indices to actual participant IDs
        let manualByeIds: number[] | undefined;
        if (byeConfig?.method === 'manual' && byeConfig.manualIds) {
          manualByeIds = byeConfig.manualIds.map(index => participantIds[index]);
        }

        const bracketMatches = generateKnockoutBracket({
          participantIds,
          byeMethod: byeConfig?.method ?? 'random',
          manualByeIds,
        });

        // Create all matches first (without bracket links)
        const createdMatchIds: number[] = [];
        for (const bracketMatch of bracketMatches) {
          let matchId: number;
          
          if (sport === 'badminton') {
            const match = createBadmintonMatch(
              tournament.id,
              bracketMatch.participantAId!,
              bracketMatch.participantBId,
              format.gamePoint ?? badmintonSport.defaultFormat.gamePoint,
              format.bestOfGames ?? badmintonSport.defaultFormat.bestOfGames,
              {
                round: bracketMatch.round,
                bracketPosition: bracketMatch.bracketPosition,
              }
            );
            matchId = match.id;
          } else {
            const match = createTennisMatch(
              tournament.id,
              bracketMatch.participantAId!,
              bracketMatch.participantBId,
              format.setsToWin ?? tennisSport.defaultFormat.setsToWin,
              format.gamesToWinPerSet ?? tennisSport.defaultFormat.gamesToWinPerSet,
              {
                round: bracketMatch.round,
                bracketPosition: bracketMatch.bracketPosition,
              }
            );
            matchId = match.id;
          }
          
          createdMatchIds.push(matchId);
        }

        // Update bracket links now that all matches have IDs
        for (let i = 0; i < bracketMatches.length; i++) {
          const bracketMatch = bracketMatches[i];
          if (bracketMatch.feedsIntoMatchId !== null && bracketMatch.feedsIntoSlot !== null) {
            const targetMatchIndex = bracketMatch.feedsIntoMatchId;
            const targetMatchId = createdMatchIds[targetMatchIndex];
            
            if (sport === 'badminton') {
              updateBadmintonMatchBracketLink(
                createdMatchIds[i],
                targetMatchId,
                bracketMatch.feedsIntoSlot
              );
            } else {
              updateTennisMatchBracketLink(
                createdMatchIds[i],
                targetMatchId,
                bracketMatch.feedsIntoSlot
              );
            }
          }
        }

        // Auto-complete bye matches and advance winners
        // Done after bracket links are set so we know where to advance to
        for (let i = 0; i < bracketMatches.length; i++) {
          const bracketMatch = bracketMatches[i];
          if (bracketMatch.participantBId === null && bracketMatch.participantAId !== null) {
            const matchId = createdMatchIds[i];
            const winnerId = bracketMatch.participantAId;
            
            // Mark bye match as completed
            if (sport === 'badminton') {
              updateBadmintonMatchStatus(matchId, 'completed', winnerId);
            } else {
              updateTennisMatchStatus(matchId, 'completed', winnerId);
            }
            
            // Advance winner to next match
            if (bracketMatch.feedsIntoMatchId !== null && bracketMatch.feedsIntoSlot !== null) {
              const targetMatchId = createdMatchIds[bracketMatch.feedsIntoMatchId];
              if (sport === 'badminton') {
                updateBadmintonMatchParticipant(targetMatchId, bracketMatch.feedsIntoSlot, winnerId);
              } else {
                updateTennisMatchParticipant(targetMatchId, bracketMatch.feedsIntoSlot, winnerId);
              }
            }
          }
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
