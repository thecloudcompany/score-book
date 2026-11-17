import type { WildcardMetric } from '@/types';
import { createRng, shuffle } from './rng';

interface PoolSettings {
  poolCount: number;
  startingSlots: number;
  qualifiersPerPool: number;
}

export interface PoolAdvancement extends PoolSettings {
  wildcardMetric: WildcardMetric;
}

// Aim for about 4 players per pool, never fewer than 2 pools.
export function recommendedPoolCount(playerCount: number): number {
  return Math.max(2, Math.ceil(playerCount / 4));
}

// Sizes differ by at most 1; the extra players fill the first pools.
export function poolSizes(playerCount: number, poolCount: number): number[] {
  const base = Math.floor(playerCount / poolCount);
  const extra = playerCount % poolCount;
  return Array.from({ length: poolCount }, (_, i) => base + (i < extra ? 1 : 0));
}

// Knockout sizes that leave someone eliminated: 2, 4, 8, … below the player count.
export function slotOptions(playerCount: number, poolCount = 2): number[] {
  const options: number[] = [];
  for (let slots = 2; slots < playerCount; slots *= 2) {
    if (slots >= poolCount) options.push(slots);
  }
  return options;
}

export function startingRoundLabel(slots: number): string {
  if (slots === 2) return 'Final';
  if (slots === 4) return 'Semifinals';
  if (slots === 8) return 'Quarterfinals';
  return `Round of ${slots}`;
}

export function knockoutPath(slots: number): string {
  const rounds: string[] = [];
  for (let remaining = slots; remaining >= 2; remaining /= 2) {
    rounds.push(startingRoundLabel(remaining));
  }
  return rounds.join(' → ');
}

export function advancementLabel(settings: PoolSettings): string {
  const extra = settings.startingSlots - settings.poolCount * settings.qualifiersPerPool;
  return `Top ${settings.qualifiersPerPool} per group${extra > 0 ? ` + ${extra} best remaining` : ''}`;
}

export function poolLabel(position: number): string {
  return position < 26 ? `Group ${String.fromCharCode(65 + position)}` : `Group ${position + 1}`;
}

export function settingsProblem(playerCount: number, settings: PoolSettings): string | null {
  const { poolCount, startingSlots, qualifiersPerPool } = settings;
  if (poolCount < 2) return 'Use at least 2 pools';
  if (playerCount < poolCount * 2) return 'Each pool needs at least 2 players';
  const smallestPool = Math.floor(playerCount / poolCount);
  if (qualifiersPerPool < 1 || qualifiersPerPool > smallestPool) {
    return `Qualifiers per pool must be between 1 and ${smallestPool}`;
  }
  const isPowerOfTwo = startingSlots >= 2 && (startingSlots & (startingSlots - 1)) === 0;
  if (!isPowerOfTwo) return 'Pick a valid starting round';
  if (startingSlots >= playerCount) return 'Pick a smaller starting round, or everyone would advance';
  const seatsNeeded = poolCount * qualifiersPerPool;
  if (seatsNeeded > startingSlots) {
    return `${poolCount} pools × ${qualifiersPerPool} = ${seatsNeeded} qualifiers, but this round has ${startingSlots} places`;
  }
  return null;
}

export function defaultSettingsForPools(playerCount: number, poolCount: number): PoolSettings {
  const options = slotOptions(playerCount, poolCount);
  const startingSlots = options.filter((slots) => slots <= playerCount / 2).at(-1) ?? options[0] ?? 2;
  return { poolCount, startingSlots, qualifiersPerPool: Math.max(1, Math.floor(startingSlots / poolCount)) };
}

// Every group needs at least 2 players.
export function maxGroupCount(playerCount: number): number {
  return Math.max(2, Math.floor(playerCount / 2));
}

export function advancementForGroups(playerCount: number, poolCount: number, slots?: number | null): PoolAdvancement {
  const defaults = defaultSettingsForPools(playerCount, poolCount);
  const startingSlots = slots != null && slotOptions(playerCount, poolCount).includes(slots)
    ? slots
    : defaults.startingSlots;
  return {
    poolCount,
    startingSlots,
    qualifiersPerPool: Math.max(1, Math.floor(startingSlots / poolCount)),
    wildcardMetric: 'win_rate',
  };
}

// Shuffle a sorted id list, then deal it out in size order.
export function assignPools(participantIds: number[], sizes: number[], seed: number): number[][] {
  const shuffled = shuffle([...participantIds].sort((a, b) => a - b), createRng(seed));
  const groups: number[][] = [];
  let offset = 0;
  for (const size of sizes) {
    groups.push(shuffled.slice(offset, offset + size));
    offset += size;
  }
  return groups;
}

// Smallest pool gets the newcomer; random among equally small pools.
// If every pool is the same size, the first pool (position 0) gets them.
export function newcomerPoolIndex(sizes: number[], random: () => number = Math.random): number {
  const smallest = Math.min(...sizes);
  const candidates = sizes.flatMap((size, index) => (size === smallest ? [index] : []));
  if (candidates.length === sizes.length) return 0;
  return candidates[Math.floor(random() * candidates.length)];
}
