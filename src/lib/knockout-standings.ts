import type { Participant, Match, KnockoutStandings } from '@/types';

/**
 * Calculate knockout tournament standings based on elimination status
 */
export function calculateKnockoutStandings(
  participants: Participant[],
  matches: Match[]
): KnockoutStandings {
  // Find the final match (no feedsIntoMatchId)
  const finalMatch = matches.find(m => !m.feedsIntoMatchId);
  
  // Determine champion
  const champion = finalMatch?.status === 'completed' ? finalMatch.winnerId : null;

  // Track elimination round for each participant
  const eliminations = new Map<number, number>();
  
  for (const match of matches) {
    if (match.status === 'completed' && match.winnerId !== null) {
      // Determine loser
      const loserId = match.participantAId === match.winnerId 
        ? match.participantBId 
        : match.participantAId;
      
      // Only track if loser is not null (not a bye match)
      if (loserId !== null) {
        eliminations.set(loserId, match.round || 1);
      }
    }
  }

  // Group participants by status
  const stillCompeting: Participant[] = [];
  const eliminatedByRound = new Map<number, Participant[]>();

  for (const participant of participants) {
    if (participant.id === champion) {
      // Champion - will be shown separately
      continue;
    }

    if (eliminations.has(participant.id)) {
      // Eliminated
      const round = eliminations.get(participant.id)!;
      if (!eliminatedByRound.has(round)) {
        eliminatedByRound.set(round, []);
      }
      eliminatedByRound.get(round)!.push(participant);
    } else {
      // Still competing
      stillCompeting.push(participant);
    }
  }

  return {
    champion,
    stillCompeting,
    eliminatedByRound,
  };
}

/**
 * Check if a match can be edited (no downstream effects)
 */
export function canEditMatch(match: Match, matches: Match[]): boolean {
  // If this match doesn't feed into another match, it can be edited
  if (!match.feedsIntoMatchId) {
    return true;
  }

  // Find the next match
  const nextMatch = matches.find(m => m.id === match.feedsIntoMatchId);
  if (!nextMatch) {
    return true;
  }

  // If the next match already has both participants, it's locked
  if (nextMatch.participantAId !== null && nextMatch.participantBId !== null) {
    return false;
  }

  return true;
}

/**
 * Check if a match is playable (both participants known)
 */
export function isMatchPlayable(match: Match): boolean {
  return match.participantAId !== null && match.participantBId !== null;
}

/**
 * Check if a match is a bye match
 * Bye matches are only in Round 1 where one participant gets a free pass
 */
export function isByeMatch(match: Match): boolean {
  return match.round === 1 
    && match.participantBId === null 
    && match.status === 'completed';
}

/**
 * Get the display label for a null participant slot
 * - Round 1: "BYE" (auto-completed bye match)
 * - Later rounds: "TBD" (waiting for winner from previous match)
 */
export function getParticipantPlaceholder(match: Match, slot: 'A' | 'B'): string {
  if (match.round === 1 && match.status === 'completed') {
    return 'BYE';
  }
  return 'TBD';
}
