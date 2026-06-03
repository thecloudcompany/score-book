export function generateRoundRobin(participantIds: number[]): [number, number][] {
  const ids = [...participantIds];

  // If odd, add a BYE
  if (ids.length % 2 === 1) {
    ids.push(-1);
  }

  const pairings: [number, number][] = [];
  const totalRounds = ids.length - 1;

  for (let round = 0; round < totalRounds; round++) {
    for (let i = 0; i < ids.length / 2; i++) {
      const a = ids[i];
      const b = ids[ids.length - 1 - i];
      if (a !== -1 && b !== -1) {
        pairings.push([a, b]);
      }
    }
    // Rotate (keep first element fixed)
    const last = ids.pop()!;
    ids.splice(1, 0, last);
  }

  return pairings;
}
