// Scoreboard theme: paper-white surfaces, near-black ink, one court-green accent.

export const Font = {
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  extrabold: 'Figtree_800ExtraBold',
};

export const Colors = {
  // Surfaces
  bg: '#F3F6F5',
  bgElevated: '#FFFFFF',
  surface: '#E9EFED',

  // Lines
  border: '#D5DEDB',
  borderLight: '#E6ECEA',

  // Ink
  text: '#111A18',
  textSecondary: '#4B5A57',
  textMuted: '#74837F',
  textInverse: '#FFFFFF',

  // Accent: court green. Used for actions and live state only.
  primary: '#0B7A6B',
  primaryDark: '#064E43',
  primaryDeep: '#03332C',
  primaryMuted: 'rgba(11, 122, 107, 0.10)',
  primarySoft: 'rgba(11, 122, 107, 0.16)',
  gold: '#E3B341',
  goldSoft: 'rgba(227, 179, 65, 0.16)',
  live: '#F04B3E',

  success: '#15803D',



  danger: '#B42318',

  overlay: 'rgba(17, 26, 24, 0.35)',
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Sentence-case text scale. Components should use these, not ad-hoc sizes.
export const Type = {
  title: 26,
  section: 17,
  body: 15,
  meta: 13,
};

export function statusColor(status: string): string {
  switch (status) {
    case 'completed':
      return Colors.success;
    case 'in_progress':
    case 'active':
      return Colors.primary;
    case 'upcoming':
    default:
      return Colors.textMuted;
  }
}

export const Motion = {
  duration: { modal: 200, layout: 200, reveal: 200, enter: 420 },
  stagger: 55,
  easeOut: [0.23, 1, 0.32, 1] as const,
  drawer: [0.32, 0.72, 0, 1] as const,
};

// Layered, low-opacity shadows read as depth rather than as borders.
export const Shadow = {
  card: {
    shadowColor: '#0B2B26',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  lift: {
    shadowColor: '#0B2B26',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
  },
};

export const Gradients = {
  hero: ['#0E8F7E', '#064E43', '#03332C'] as const,
  button: ['#10927F', '#0B7A6B'] as const,
  gold: ['#F2CF73', '#D9A21F'] as const,
};
