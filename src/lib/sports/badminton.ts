import type { ValidationResult, ScoringUnit, MatchFormat } from '@/types';
import type { Sport } from '@/types';

export const badmintonSport: Sport = {
  id: 'badminton',
  name: 'Badminton',
  defaultFormat: {
    gamePoint: 21,
    bestOfGames: 3,
  },

  validateUnitScore(scoreA: number, scoreB: number, format: MatchFormat): ValidationResult {
    const gamePoint = format.gamePoint ?? 21;

    if (scoreA < 0 || scoreB < 0) {
      return { valid: false, error: 'Scores cannot be negative' };
    }
    if (scoreA === scoreB) {
      return { valid: false, error: 'Scores cannot be tied' };
    }

    const winnerScore = Math.max(scoreA, scoreB);

    if (winnerScore < gamePoint) {
      return { valid: false, error: `Winner must reach at least ${gamePoint} points` };
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
    const winner = this.determineWinner(units, format);
    return winner !== null;
  },

  getUnitCount(format: MatchFormat): number {
    return format.bestOfGames ?? 3;
  },

  tieBreakers: ['wins', 'pointDiff', 'gameDiff'],
};
