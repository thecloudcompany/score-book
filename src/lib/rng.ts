// Seeded PRNG (mulberry32) so a stored seed reproduces the same pool split and draw.
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 4294967296);
}

// Stable per-participant value from the tournament seed, used as the final
// tiebreak so the same tie always resolves the same way.
export function tieKey(seed: number, participantId: number): number {
  return createRng((seed ^ Math.imul(participantId, 0x9e3779b1)) >>> 0)();
}
