export type SportType = 'badminton' | 'tennis';

export type TournamentStatus = 'upcoming' | 'active' | 'completed';

export type MatchStatus = 'upcoming' | 'in_progress' | 'completed';

export interface Tournament {
  id: number;
  name: string;
  sport: SportType;
  status: TournamentStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Participant {
  id: number;
  tournamentId: number;
  name: string;
  createdAt: number;
}

export interface BaseMatch {
  id: number;
  tournamentId: number;
  participantAId: number;
  participantBId: number;
  status: MatchStatus;
  winnerId: number | null;
  createdAt: number;
}

export interface BadmintonMatch extends BaseMatch {
  gamePoint: number;
  bestOfGames: number;
}

export interface BadmintonGame {
  id: number;
  matchId: number;
  gameNumber: number;
  scoreA: number | null;
  scoreB: number | null;
}

export interface TennisMatch extends BaseMatch {
  setsToWin: number;
  gamesToWinPerSet: number;
}

export interface TennisSet {
  id: number;
  matchId: number;
  setNumber: number;
  gamesA: number | null;
  gamesB: number | null;
}

export type Match = BadmintonMatch | TennisMatch;

export interface ScoringUnit {
  unitNumber: number;
  scoreA: number | null;
  scoreB: number | null;
}

export interface LeaderboardEntry {
  participantId: number;
  name: string;
  wins: number;
  losses: number;
  pointDiff: number;
  gameDiff: number;
  rank: number;
  tiedWith: number[];
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface MatchFormat {
  [key: string]: number;
}

export interface Sport {
  id: string;
  name: string;
  defaultFormat: MatchFormat;
  validateUnitScore(scoreA: number, scoreB: number, format: MatchFormat): ValidationResult;
  determineWinner(units: ScoringUnit[], format: MatchFormat): 'a' | 'b' | null;
  isMatchComplete(units: ScoringUnit[], format: MatchFormat): boolean;
  getUnitCount(format: MatchFormat): number;
  tieBreakers: string[];
}
