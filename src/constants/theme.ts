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
  bg: '#FFFFFF',
  bgElevated: '#FFFFFF',
  surface: '#EEF2F1',

  // Lines
  border: '#D5DEDB',
  borderLight: '#E6ECEA',

  // Ink
  text: '#111A18',
  textSecondary: '#4B5A57',
  textMuted: '#74837F',
  textInverse: '#FFFFFF',

  // Accent: court green. Used for actions and live state only.
  primary: '#0D7A6C',
  primaryMuted: 'rgba(13, 122, 108, 0.10)',

  success: '#15803D',



  danger: '#B42318',

  overlay: 'rgba(17, 26, 24, 0.35)',
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
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
  duration: { modal: 200, layout: 200, reveal: 200 },
  easeOut: [0.23, 1, 0.32, 1] as const,
  drawer: [0.32, 0.72, 0, 1] as const,
};
