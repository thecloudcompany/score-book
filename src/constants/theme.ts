// Modern Light Theme — Sleek, minimal, sharp corners

export const Font = {
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  extrabold: 'Figtree_800ExtraBold',
  black: 'Figtree_900Black',
};

export const Colors = {
  // Backgrounds
  bg: '#FAFBFC',           // Page background — very subtle off-white
  bgElevated: '#FFFFFF',   // Cards, sheets
  surface: '#F5F6F7',      // Subtle elevated surfaces, inputs
  surfaceHover: '#EFF1F3', // Hover states

  // Borders (thin, minimal)
  border: '#E8EAED',       // 1px dividers
  borderLight: '#F0F1F3',  // Very subtle separators

  // Text
  text: '#1A1D23',         // Primary — near black
  textSecondary: '#5A6270', // Labels, secondary
  textMuted: '#8B95A5',    // Disabled, hints
  textInverse: '#FFFFFF',  // On dark/colored bg

  // Accents — refined teal/slate
  primary: '#0D9488',      // Teal — primary action
  primaryMuted: 'rgba(13, 148, 136, 0.08)',
  primaryDark: '#0F766E',

  accent: '#0D9488',       // Alias

  // Status — refined, desaturated
  success: '#059669',      // Completed
  successMuted: 'rgba(5, 150, 105, 0.08)',

  warning: '#D97706',      // In progress
  warningMuted: 'rgba(217, 119, 6, 0.08)',

  info: '#2563EB',         // Upcoming / neutral
  infoMuted: 'rgba(37, 99, 235, 0.08)',

  danger: '#DC2626',       // Errors

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.25)',
};

export const Radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 10,
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

// Status color mapping — returns { dot: string, bg: string, text: string }
export function statusStyle(status: string): { dot: string; text: string; bg: string } {
  switch (status) {
    case 'completed':
      return { dot: Colors.success, text: Colors.success, bg: Colors.successMuted };
    case 'in_progress':
      return { dot: Colors.warning, text: Colors.warning, bg: Colors.warningMuted };
    case 'active':
      return { dot: Colors.primary, text: Colors.primary, bg: Colors.primaryMuted };
    case 'upcoming':
    default:
      return { dot: Colors.info, text: Colors.info, bg: Colors.infoMuted };
  }
}

export function statusColor(status: string): string {
  return statusStyle(status).dot;
}
