import type { ByeConfig } from '@/types';

interface BracketMatch {
  round: number;
  bracketPosition: number;
  participantAId: number | null;
  participantBId: number | null;
  feedsIntoMatchId: number | null;
  feedsIntoSlot: 'A' | 'B' | null;
}

interface BracketConfig {
  participantIds: number[];
  byeMethod: 'random' | 'manual';
  manualByeIds?: number[];
}

/**
 * Calculate the next power of 2 greater than or equal to n
 */
function nextPowerOf2(n: number): number {
  let power = 1;
  while (power < n) {
    power *= 2;
  }
  return power;
}

/**
 * Calculate how many byes are needed
 */
function calculateByesNeeded(participantCount: number): number {
  const bracketSize = nextPowerOf2(participantCount);
  return bracketSize - participantCount;
}

/**
 * Assign byes to participants
 */
function assignByes(
  participantIds: number[],
  config: ByeConfig
): { byeIds: number[]; playingIds: number[] } {
  const byesNeeded = calculateByesNeeded(participantIds.length);
  
  if (byesNeeded === 0) {
    return { byeIds: [], playingIds: participantIds };
  }

  let byeIds: number[];

  if (config.method === 'random') {
    // Fisher–Yates shuffle, then take first N
    const shuffled = [...participantIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    byeIds = shuffled.slice(0, byesNeeded);
  } else {
    // Manual selection
    byeIds = config.manualIds || [];
    if (byeIds.length !== byesNeeded) {
      throw new Error(`Expected ${byesNeeded} byes, got ${byeIds.length}`);
    }
  }

  const playingIds = participantIds.filter(id => !byeIds.includes(id));

  return { byeIds, playingIds };
}

/**
 * Generate a single elimination bracket
 */
export function generateKnockoutBracket(config: BracketConfig): BracketMatch[] {
  const { participantIds, byeMethod, manualByeIds } = config;
  
  if (participantIds.length < 2) {
    throw new Error('Need at least 2 participants for knockout tournament');
  }

  const bracketSize = nextPowerOf2(participantIds.length);
  const totalRounds = Math.log2(bracketSize);

  // Assign byes
  const { byeIds, playingIds } = assignByes(participantIds, {
    method: byeMethod,
    manualIds: manualByeIds,
  });

  const matches: BracketMatch[] = [];

  // Generate Round 1 matches (only for non-bye participants)
  const round1Matches: BracketMatch[] = [];
  for (let i = 0; i < playingIds.length; i += 2) {
    const match: BracketMatch = {
      round: 1,
      bracketPosition: Math.floor(i / 2) + 1,
      participantAId: playingIds[i],
      participantBId: playingIds[i + 1] || null, // Handle odd number (shouldn't happen with byes)
      feedsIntoMatchId: null, // Will be set later
      feedsIntoSlot: null,
    };
    round1Matches.push(match);
    matches.push(match);
  }

  // Generate bye matches (Round 1 matches that auto-complete)
  const byeMatches: BracketMatch[] = [];
  for (const byeId of byeIds) {
    const match: BracketMatch = {
      round: 1,
      bracketPosition: round1Matches.length + byeMatches.length + 1,
      participantAId: byeId,
      participantBId: null, // BYE
      feedsIntoMatchId: null, // Will be set later
      feedsIntoSlot: null,
    };
    byeMatches.push(match);
    matches.push(match);
  }

  // Combine Round 1 matches (playing + byes) and sort by bracket position
  const allRound1Matches = [...round1Matches, ...byeMatches].sort(
    (a, b) => a.bracketPosition - b.bracketPosition
  );

  // Generate subsequent rounds
  let previousRoundMatches = allRound1Matches;
  
  for (let round = 2; round <= totalRounds; round++) {
    const currentRoundMatches: BracketMatch[] = [];
    
    for (let i = 0; i < previousRoundMatches.length; i += 2) {
      const match: BracketMatch = {
        round,
        bracketPosition: Math.floor(i / 2) + 1,
        participantAId: null, // TBD - winner of previous match
        participantBId: null, // TBD - winner of previous match
        feedsIntoMatchId: null, // Will be set in next iteration
        feedsIntoSlot: null,
      };
      currentRoundMatches.push(match);
      matches.push(match);
    }

    // Link previous round matches to current round
    for (let i = 0; i < previousRoundMatches.length; i += 2) {
      const currentMatchIndex = Math.floor(i / 2);
      const currentMatch = currentRoundMatches[currentMatchIndex];
      
      // Find the index of currentMatch in the full matches array
      const currentMatchGlobalIndex = matches.indexOf(currentMatch);
      
      previousRoundMatches[i].feedsIntoMatchId = currentMatchGlobalIndex;
      previousRoundMatches[i].feedsIntoSlot = 'A';
      
      if (i + 1 < previousRoundMatches.length) {
        previousRoundMatches[i + 1].feedsIntoMatchId = currentMatchGlobalIndex;
        previousRoundMatches[i + 1].feedsIntoSlot = 'B';
      }
    }

    previousRoundMatches = currentRoundMatches;
  }

  return matches;
}

/**
 * Get round name based on participants remaining
 */
export function getRoundName(round: number, totalRounds: number): string {
  const roundsRemaining = totalRounds - round + 1;
  
  if (roundsRemaining === 1) return 'Final';
  if (roundsRemaining === 2) return 'Semifinals';
  if (roundsRemaining === 3) return 'Quarterfinals';

  return `Round of ${2 ** roundsRemaining}`;
}
