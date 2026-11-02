import type { WildcardMetric } from '@/types';
import type { PoolStandingRow } from './pool-standings';

export interface QualifierPick {
  participantId: number;
  poolId: number;
  poolRank: number;
  source: 'direct' | 'wildcard';
}

interface PoolRanking {
  poolId: number;
  ranked: PoolStandingRow[];
}

function metricValues(row: PoolStandingRow, metric: WildcardMetric): [number, number] {
  return metric === 'win_rate'
    ? [row.winRate, row.pointDiffPerMatch]
    : [row.pointDiffPerMatch, row.winRate];
}

// Top `qualifiersPerPool` from each pool go straight through. Remaining seats are
// filled rank by rank: all 2nd-placed players before any 3rd-placed one, ordered
// by the wildcard metric within each rank.
export function pickQualifiers(
  pools: PoolRanking[],
  slots: number,
  qualifiersPerPool: number,
  metric: WildcardMetric
): QualifierPick[] {
  const picks: QualifierPick[] = [];
  const deepest = Math.max(0, ...pools.map((pool) => pool.ranked.length));

  for (let rank = 1; rank <= deepest && picks.length < slots; rank++) {
    const tier = pools.flatMap((pool) => {
      const row = pool.ranked[rank - 1];
      return row ? [{ poolId: pool.poolId, row }] : [];
    });

    if (rank <= qualifiersPerPool) {
      for (const { poolId, row } of tier) {
        picks.push({ participantId: row.participantId, poolId, poolRank: rank, source: 'direct' });
      }
      continue;
    }

    const ordered = [...tier].sort((x, y) => {
      const [px, sx] = metricValues(x.row, metric);
      const [py, sy] = metricValues(y.row, metric);
      return py - px || sy - sx || y.row.tieKey - x.row.tieKey;
    });
    for (const { poolId, row } of ordered.slice(0, slots - picks.length)) {
      picks.push({ participantId: row.participantId, poolId, poolRank: rank, source: 'wildcard' });
    }
  }

  return picks;
}
