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
export function slotOptions(playerCount: number): number[] {
  const options: number[] = [];
  for (let slots = 2; slots < playerCount; slots *= 2) options.push(slots);
  return options;
}

export function startingRoundLabel(slots: number): string {
  if (slots === 2) return 'Final';
  if (slots === 4) return 'Semifinals';
  if (slots === 8) return 'Quarterfinals';
  return `Round of ${slots}`;
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
  if (poolCount === 2 && startingSlots > 4) return 'With 2 pools, start at Semifinals or the Final';
  return null;
}

export function defaultSettingsForPools(playerCount: number, poolCount: number): PoolSettings {
  const smallestPool = Math.floor(playerCount / poolCount);
  const candidates = slotOptions(playerCount)
    .filter((slots) => slots <= playerCount / 2)
    .reverse();
  for (const startingSlots of candidates) {
    const qualifiersPerPool = Math.min(smallestPool, Math.max(1, Math.floor(startingSlots / poolCount)));
    const settings = { poolCount, startingSlots, qualifiersPerPool };
    if (settingsProblem(playerCount, settings) === null) return settings;
  }
  return { poolCount, startingSlots: 2, qualifiersPerPool: 1 };
}

// The settings used when the owner doesn't change anything: the same numbers
// the create screen and Settings both start from.
export function defaultAdvancement(playerCount: number): PoolAdvancement {
  return { ...defaultSettingsForPools(playerCount, recommendedPoolCount(playerCount)), wildcardMetric: 'win_rate' };
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
