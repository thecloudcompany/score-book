import type { BadmintonMatch, Participant, Pool, Tournament } from '@/types';
import {
  createBadmintonMatch,
  createParticipant,
  createPool,
  deleteBadmintonFixtures,
  getBadmintonGames,
  getBadmintonMatches,
  getParticipants,
  getPools,
  getTournament,
  insertQualifiers,
  markKnockoutSet,
  setParticipantPool,
  setPoolAdvancement,
  setTournamentPoolConfig,
  updateBadmintonMatchBracketLink,
  updateTournamentStatus,
} from './db-operations';
import { generateKnockoutBracket } from './bracket-generator';
import { generateRoundRobin } from './scheduler';
import {
  assignPools,
  newcomerPoolIndex,
  poolLabel,
  poolSizes,
  settingsProblem,
  type PoolAdvancement,
} from './pool-rules';
import { createRng, randomSeed, shuffle } from './rng';
import { computePoolStandings, type PoolMatch, type PoolStandingRow } from './pool-standings';
import { pickQualifiers, type QualifierPick } from './qualifiers';

export interface PoolView {
  pool: Pool;
  rows: PoolStandingRow[];
}

interface KnockoutPreview {
  picks: QualifierPick[];
  order: number[];
  canShuffle: boolean;
}

interface Format {
  gamePoint: number;
  bestOfGames: number;
}

function currentFormat(tournamentId: number): Format {
  const first = getBadmintonMatches(tournamentId)[0];
  if (!first) throw new Error('This tournament has no matches');
  return { gamePoint: first.gamePoint, bestOfGames: first.bestOfGames };
}

function toPoolMatch(match: BadmintonMatch): PoolMatch {
  return {
    participantAId: match.participantAId,
    participantBId: match.participantBId,
    winnerId: match.winnerId,
    status: match.status,
    winsNeeded: Math.ceil(match.bestOfGames / 2),
    games: getBadmintonGames(match.id),
  };
}

function createPoolFixtures(
  tournamentId: number,
  participantIds: number[],
  poolCount: number,
  poolSeed: number,
  format: Format
): void {
  const groups = assignPools(participantIds, poolSizes(participantIds.length, poolCount), poolSeed);
  groups.forEach((members, position) => {
    const poolId = createPool(tournamentId, position, poolLabel(position));
    for (const id of members) setParticipantPool(id, poolId);
    for (const [a, b] of generateRoundRobin(members)) {
      createBadmintonMatch(tournamentId, a, b, format.gamePoint, format.bestOfGames, { poolId });
    }
  });
}

// Replaces the round-robin fixtures with pool fixtures. Only allowed before any score is entered.
export function startPools(tournamentId: number, settings: PoolAdvancement): void {
  const tournament = getTournament(tournamentId);
  if (!tournament) throw new Error('Tournament not found');
  if (tournament.type !== 'round_robin' || tournament.sport !== 'badminton') {
    throw new Error('Pools are only available for badminton round robin');
  }
  if (tournament.stage) throw new Error('Pools have already started');

  const participants = getParticipants(tournamentId);
  const problem = settingsProblem(participants.length, settings);
  if (problem) throw new Error(problem);

  const scored = getBadmintonMatches(tournamentId).some((m) =>
    getBadmintonGames(m.id).some((g) => g.scoreA !== null || g.scoreB !== null)
  );
  if (scored) throw new Error('Clear the scores before starting pools');

  const format = currentFormat(tournamentId);
  const poolSeed = randomSeed();
  deleteBadmintonFixtures(tournamentId);
  setTournamentPoolConfig(tournamentId, { ...settings, poolSeed });
  createPoolFixtures(
    tournamentId,
    participants.map((p) => p.id),
    settings.poolCount,
    poolSeed,
    format
  );
}

// Changes only the knockout settings, and only while the knockout is still undrawn.
export function updatePoolAdvancement(
  tournamentId: number,
  advancement: Omit<PoolAdvancement, 'poolCount'>
): void {
  const tournament = getTournament(tournamentId);
  if (!tournament || tournament.stage !== 'pools') {
    throw new Error(tournament?.stage === 'knockout' ? 'The knockout is already set' : 'Start pools first');
  }
  const playerCount = getParticipants(tournamentId).length;
  const problem = settingsProblem(playerCount, { ...advancement, poolCount: tournament.poolCount ?? 2 });
  if (problem) throw new Error(problem);
  setPoolAdvancement(tournamentId, advancement);
}

export function getPoolViews(tournamentId: number): PoolView[] {
  const pools = getPools(tournamentId);
  if (pools.length === 0) return [];
  const seed = getTournament(tournamentId)?.poolSeed ?? 0;
  const participants = getParticipants(tournamentId);
  const poolMatches = getBadmintonMatches(tournamentId).filter((m) => m.poolId != null);

  return pools.map((pool) => {
    const memberIds = participants.filter((p) => p.poolId === pool.id).map((p) => p.id);
    const matches = poolMatches.filter((m) => m.poolId === pool.id).map(toPoolMatch);
    return { pool, rows: computePoolStandings(memberIds, matches, seed) };
  });
}

function poolStageFinished(tournamentId: number): boolean {
  const poolMatches = getBadmintonMatches(tournamentId).filter((m) => m.poolId != null);
  return poolMatches.length > 0 && poolMatches.every((m) => m.status === 'completed');
}

// New players can join until the knockout is set.
export function lateAdditionsOpen(tournament: Tournament): boolean {
  return tournament.stage !== 'knockout';
}

// Pure preview: nothing is written until lockKnockout.
export function previewKnockout(tournamentId: number, bracketSeed: number): KnockoutPreview {
  const tournament = getTournament(tournamentId);
  if (!tournament || tournament.stage !== 'pools') throw new Error('The knockout is already set');
  if (!poolStageFinished(tournamentId)) throw new Error('Finish every pool match first');

  const views = getPoolViews(tournamentId);
  const picks = pickQualifiers(
    views.map((view) => ({ poolId: view.pool.id, ranked: view.rows })),
    tournament.startingSlots ?? 0,
    tournament.qualifiersPerPool ?? 1,
    tournament.wildcardMetric ?? 'win_rate'
  );
  if (picks.length !== tournament.startingSlots) throw new Error('Not enough players to fill the knockout');

  const crossover = fixedCrossoverOrder(picks, views.map((view) => view.pool.id));
  const order = crossover ?? shuffle(
    picks.map((pick) => pick.participantId),
    createRng(bracketSeed)
  );
  return { picks, order, canShuffle: crossover === null };
}

// [group position, finishing rank], in bracket order. Keep A1/B1 (and C1/D1)
// in opposite halves so they cannot meet before the final.
function fixedCrossoverOrder(picks: QualifierPick[], poolIds: number[]): number[] | null {
  const layouts: Record<string, [number, number][]> = {
    '2:2': [[0, 1], [1, 1]],
    '2:4': [[0, 1], [1, 2], [1, 1], [0, 2]],
    '2:8': [[0, 1], [1, 4], [1, 2], [0, 3], [1, 1], [0, 4], [0, 2], [1, 3]],
    '4:8': [[0, 1], [1, 2], [2, 1], [3, 2], [1, 1], [0, 2], [3, 1], [2, 2]],
  };
  const layout = layouts[`${poolIds.length}:${picks.length}`];
  if (!layout) return null;
  const ordered = layout.map(([group, rank]) =>
    picks.find((pick) => pick.poolId === poolIds[group] && pick.poolRank === rank)
  );
  if (ordered.some((pick) => pick === undefined)) return null;
  return ordered.map((pick) => pick!.participantId);
}

export function lockKnockout(tournamentId: number, bracketSeed: number): void {
  const { picks, order } = previewKnockout(tournamentId, bracketSeed);
  const format = currentFormat(tournamentId);
  const bracket = generateKnockoutBracket({ participantIds: order, byeMethod: 'random' });

  const matchIds = bracket.map(
    (match) =>
      createBadmintonMatch(tournamentId, match.participantAId, match.participantBId, format.gamePoint, format.bestOfGames, {
        round: match.round,
        bracketPosition: match.bracketPosition,
      }).id
  );
  bracket.forEach((match, index) => {
    if (match.feedsIntoMatchId !== null && match.feedsIntoSlot !== null) {
      updateBadmintonMatchBracketLink(matchIds[index], matchIds[match.feedsIntoMatchId], match.feedsIntoSlot);
    }
  });

  insertQualifiers(tournamentId, picks);
  markKnockoutSet(tournamentId, bracketSeed);
}

export function addLateParticipant(tournamentId: number, name: string): Participant {
  const tournament = getTournament(tournamentId);
  if (!tournament) throw new Error('Tournament not found');
  if (!lateAdditionsOpen(tournament)) throw new Error('Late additions are closed');

  const existing = getParticipants(tournamentId);
  const format = currentFormat(tournamentId);
  const participant = createParticipant(tournamentId, name);

  let poolId: number | null = null;
  let opponentIds = existing.map((p) => p.id);
  if (tournament.stage === 'pools') {
    const pools = getPools(tournamentId);
    const sizes = pools.map((pool) => existing.filter((p) => p.poolId === pool.id).length);
    poolId = pools[newcomerPoolIndex(sizes)].id;
    setParticipantPool(participant.id, poolId);
    opponentIds = existing.filter((p) => p.poolId === poolId).map((p) => p.id);
  }

  for (const opponentId of opponentIds) {
    createBadmintonMatch(tournamentId, participant.id, opponentId, format.gamePoint, format.bestOfGames, { poolId });
  }
  if (tournament.status === 'completed') updateTournamentStatus(tournamentId, 'active');

  return { ...participant, poolId };
}

