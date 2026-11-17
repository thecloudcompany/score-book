export type SportType = 'badminton' | 'tennis' | 'table_tennis' | 'pickleball';

export type TournamentType = 'round_robin' | 'knockout';

export type TournamentStatus = 'upcoming' | 'active' | 'completed';

export type MatchStatus = 'upcoming' | 'in_progress' | 'completed';

export type WildcardMetric = 'win_rate' | 'point_diff_per_match';

export type PoolStage = 'pools' | 'knockout';

export interface Tournament {
  id: number;
  name: string;
  sport: SportType;
  type: TournamentType;
  status: TournamentStatus;
  createdAt: number;
  updatedAt: number;
  // Pool stage (round robin pools → knockout). Null for tournaments without pools.
  poolCount?: number | null;
  startingSlots?: number | null;
  qualifiersPerPool?: number | null;
  wildcardMetric?: WildcardMetric | null;
  stage?: PoolStage | null;
  poolSeed?: number | null;
  bracketSeed?: number | null;
}

export interface Pool {
  id: number;
  tournamentId: number;
  position: number;
  name: string;
}

export interface QualifierRecord {
  participantId: number;
  poolId: number;
  poolRank: number;
  source: 'direct' | 'wildcard';
}

export interface Participant {
  id: number;
  tournamentId: number;
  name: string;
  createdAt: number;
  poolId?: number | null;
}

interface BaseMatch {
  id: number;
  tournamentId: number;
  participantAId: number | null; // null = TBD in later knockout rounds
  participantBId: number | null; // null for bye matches
  status: MatchStatus;
  winnerId: number | null;
  createdAt: number;
  // Pool stage: set on pool matches, null on knockout matches
  poolId?: number | null;
  // Knockout bracket fields
  round?: number;
  bracketPosition?: number;
  feedsIntoMatchId?: number | null;
  feedsIntoSlot?: 'A' | 'B' | null;
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

export interface TableTennisMatch extends BaseMatch {
  gamePoint: number;
  bestOfGames: number;
}

export interface TableTennisGame {
  id: number;
  matchId: number;
  gameNumber: number;
  scoreA: number | null;
  scoreB: number | null;
}

export interface PickleballMatch extends BaseMatch {
  gamePoint: number;
  bestOfGames: number;
}

export interface PickleballGame {
  id: number;
  matchId: number;
  gameNumber: number;
  scoreA: number | null;
  scoreB: number | null;
}

export type Match = BadmintonMatch | TennisMatch | TableTennisMatch | PickleballMatch;

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

export interface KnockoutStandings {
  champion: number | null;
  stillCompeting: Participant[];
  eliminatedByRound: Map<number, Participant[]>;
}

export interface ByeConfig {
  method: 'random' | 'manual';
  manualIds?: number[];
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
}
