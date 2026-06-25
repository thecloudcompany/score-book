import type { ValidationResult, ScoringUnit, MatchFormat, Sport } from '@/types';

export const tableTennisSport: Sport = {
  id: 'table_tennis',
  name: 'Table Tennis',
  defaultFormat: {
    gamePoint: 11,
    bestOfGames: 3,
  },

  validateUnitScore(scoreA: number, scoreB: number, format: MatchFormat): ValidationResult {
    const gamePoint = format.gamePoint ?? 11;

    if (scoreA < 0 || scoreB < 0) {
      return { valid: false, error: 'Scores cannot be negative' };
    }
    if (scoreA === scoreB) {
      return { valid: false, error: 'Game cannot be tied' };
    }

    const winnerScore = Math.max(scoreA, scoreB);
    const loserScore = Math.min(scoreA, scoreB);

    if (winnerScore < gamePoint) {
      return { valid: false, error: `Winner must reach at least ${gamePoint} points` };
    }
    if (winnerScore - loserScore < 2) {
      return { valid: false, error: 'Winner must lead by at least 2 points' };
    }

    return { valid: true };
  },

  determineWinner(units: ScoringUnit[], format: MatchFormat): 'a' | 'b' | null {
    const winsNeeded = Math.ceil((format.bestOfGames ?? 3) / 2);
    let aWins = 0;
    let bWins = 0;

    for (const unit of units) {
      if (unit.scoreA === null || unit.scoreB === null) continue;
      if (unit.scoreA > unit.scoreB) aWins++;
      else if (unit.scoreB > unit.scoreA) bWins++;
    }

    if (aWins >= winsNeeded) return 'a';
    if (bWins >= winsNeeded) return 'b';
    return null;
  },

  isMatchComplete(units: ScoringUnit[], format: MatchFormat): boolean {
    return this.determineWinner(units, format) !== null;
  },
};
