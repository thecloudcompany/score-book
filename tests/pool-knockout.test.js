import { afterEach, beforeEach, expect, mock, test } from 'bun:test';
import { Database } from 'bun:sqlite';

let sqlite;
const adapter = {
  execSync: (query) => sqlite.exec(query),
  runSync: (query, ...params) => {
    const result = sqlite.query(query).run(...params);
    return { lastInsertRowId: result.lastInsertRowid, changes: result.changes };
  },
  getAllSync: (query, ...params) => sqlite.query(query).all(...params),
  getFirstSync: (query, ...params) => sqlite.query(query).get(...params),
};
mock.module('react-native', () => ({ Platform: { OS: 'web' } }));
mock.module('../src/lib/db-adapter', () => ({ openDatabase: () => adapter }));
const { initDatabase } = await import('../src/lib/database');
const db = await import('../src/lib/db-operations');
const { previewKnockout, lockKnockout } = await import('../src/lib/pool-operations');
const { nextStepFor } = await import('../src/lib/next-step');

beforeEach(() => {
  sqlite = new Database(':memory:');
  initDatabase();
});
afterEach(() => sqlite.close());

// One extra player per group ensures advancing eliminates someone. Earlier names
// beat later names, giving unambiguous ranks through the real standings code.
function finishGroups(groupCount, advancingPerGroup) {
  const tournament = db.createTournament('Crossover test', 'badminton', 'round_robin');
  db.setTournamentPoolConfig(tournament.id, {
    poolCount: groupCount,
    startingSlots: groupCount * advancingPerGroup,
    qualifiersPerPool: advancingPerGroup,
    wildcardMetric: 'win_rate',
    poolSeed: 1,
  });
  for (let group = 0; group < groupCount; group++) {
    const label = String.fromCharCode(65 + group);
    const poolId = db.createPool(tournament.id, group, `Group ${label}`);
    const players = Array.from({ length: advancingPerGroup + 1 }, (_, rank) =>
      db.createParticipant(tournament.id, `${label}${rank + 1}`)
    );
    for (const player of players) db.setParticipantPool(player.id, poolId);
    for (let a = 0; a < players.length; a++) {
      for (let b = a + 1; b < players.length; b++) {
        const match = db.createBadmintonMatch(tournament.id, players[a].id, players[b].id, 21, 1, { poolId });
        db.updateBadmintonGame(match.id, 1, 21, 10);
        db.updateBadmintonMatchStatus(match.id, 'completed', players[a].id);
      }
    }
  }
  return tournament.id;
}

const layouts = [
  { label: 'semifinals', groups: 2, perGroup: 2, pairs: [['A1', 'B2'], ['B1', 'A2']] },
  { label: 'quarterfinals from two groups', groups: 2, perGroup: 4,
    pairs: [['A1', 'B4'], ['B2', 'A3'], ['B1', 'A4'], ['A2', 'B3']] },
  { label: 'quarterfinals from four groups', groups: 4, perGroup: 2,
    pairs: [['A1', 'B2'], ['C1', 'D2'], ['B1', 'A2'], ['D1', 'C2']] },
];

for (const layout of layouts) {
  test(`${layout.label}: preview and saved bracket use fixed crossovers for every seed`, () => {
    const id = finishGroups(layout.groups, layout.perGroup);
    const names = new Map(db.getParticipants(id).map((player) => [player.id, player.name]));
    const asPairs = (order) => Array.from({ length: order.length / 2 }, (_, i) =>
      [names.get(order[2 * i]), names.get(order[2 * i + 1])]
    );
    for (let seed = 0; seed < 100; seed++) {
      const preview = previewKnockout(id, seed);
      expect(asPairs(preview.order)).toEqual(layout.pairs);
      expect(preview.canShuffle).toBe(false);
      expect(db.getBadmintonMatches(id).every((match) => match.poolId !== null)).toBe(true);
    }
    const preview = previewKnockout(id, 37);
    lockKnockout(id, 37);
    const firstRound = db.getBadmintonMatches(id).filter((match) => match.poolId === null && match.round === 1);
    expect(firstRound.map((match) => [names.get(match.participantAId), names.get(match.participantBId)])).toEqual(layout.pairs);
    expect(db.getQualifiers(id).map((pick) => pick.participantId).sort()).toEqual(preview.picks.map((pick) => pick.participantId).sort());
    // Group winners occupy opposite halves, so they cannot meet before the final.
    const a = firstRound.findIndex((match) => names.get(match.participantAId) === 'A1');
    const b = firstRound.findIndex((match) => names.get(match.participantAId) === 'B1');
    expect(a < firstRound.length / 2).not.toBe(b < firstRound.length / 2);
  });
}

test('fixed crossover review has no Shuffle action and still starts via confirmation', () => {
  const onLock = mock();
  const step = nextStepFor({
    tournamentType: 'round_robin', stage: 'pools',
    matches: [{ poolId: 1, status: 'completed', winnerId: 1 }],
    drawPairs: [['A1', 'B2'], ['B1', 'A2']],
    canShuffleDraw: false,
    getName: String, onDraw: mock(), onLock,
  });
  expect(step.secondary).toBeUndefined();
  expect(step.primary.confirm.title).toBe('Start knockout?');
  step.primary.onPress();
  expect(onLock).toHaveBeenCalledTimes(1);
});

test('other group layouts retain wildcard selection and a reproducible preview', () => {
  const id = finishGroups(3, 1);
  db.setPoolAdvancement(id, { startingSlots: 4, qualifiersPerPool: 1, wildcardMetric: 'win_rate' });
  const preview = previewKnockout(id, 19);
  expect(preview.canShuffle).toBe(true);
  expect(preview.picks.filter((pick) => pick.source === 'direct')).toHaveLength(3);
  expect(preview.picks.filter((pick) => pick.source === 'wildcard')).toHaveLength(1);
  expect(previewKnockout(id, 19).order).toEqual(preview.order);
  expect(new Set(preview.order).size).toBe(4);
  lockKnockout(id, 19);
  const firstRound = db.getBadmintonMatches(id).filter((match) => match.poolId === null && match.round === 1);
  expect(firstRound.flatMap((match) => [match.participantAId, match.participantBId])).toEqual(preview.order);
});
