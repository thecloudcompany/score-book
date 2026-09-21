import type { Sport } from '@/types';
import { tableTennisSport } from './table-tennis';

// ponytail: pickleball scoring is identical to table tennis (to 11, win by 2,
// best-of-N) — spread instead of cloning. If the rules ever diverge, copy
// table-tennis.ts and edit the predicate.
export const pickleballSport: Sport = {
  ...tableTennisSport,
  id: 'pickleball',
  name: 'Pickleball',
};
