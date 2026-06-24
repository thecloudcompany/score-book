import type { ValidationResult, ScoringUnit, MatchFormat, Sport } from '@/types';

export const tennisSport: Sport = {
  id: 'tennis',
  name: 'Tennis',
  defaultFormat: {
    setsToWin: 2,
    gamesToWinPerSet: 6,
  },

  validateUnitScore(scoreA: number, scoreB: number, format: MatchFormat): ValidationResult {
    const gamesToWin = format.gamesToWinPerSet ?? 6;

    if (scoreA < 0 || scoreB < 0) {
      return { valid: false, error: 'Scores cannot be negative' };
    }
    if (scoreA === scoreB) {
      return { valid: false, error: 'Set cannot be tied' };
    }

    const winnerGames = Math.max(scoreA, scoreB);

    if (winnerGames < gamesToWin) {
      return { valid: false, error: `Winner must reach at least ${gamesToWin} games` };
    }

    return { valid: true };
  },

  determineWinner(units: ScoringUnit[], format: MatchFormat): 'a' | 'b' | null {
    const winsNeeded = format.setsToWin ?? 2;
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
