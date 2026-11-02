import type { SportType, Tournament, TournamentStatus } from '@/types';

export const SPORT_LABELS: Record<SportType, string> = {
  badminton: 'Badminton',
  tennis: 'Tennis',
  table_tennis: 'Table tennis',
  pickleball: 'Pickleball',
};

export function statusLabel(status: TournamentStatus): string {
  switch (status) {
    case 'active':
      return 'In progress';
    case 'completed':
      return 'Finished';
    case 'upcoming':
    default:
      return 'Not started';
  }
}

export function playFormatLabel(tournament: Pick<Tournament, 'type' | 'poolCount'>): string {
  if (tournament.poolCount) return 'Groups, then knockout';
  return tournament.type === 'knockout' ? 'Knockout' : 'Everyone plays everyone';
}
