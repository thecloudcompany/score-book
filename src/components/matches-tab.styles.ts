import { StyleSheet } from 'react-native';
import { Font, Colors, Spacing } from '@/constants/theme';

export const s = StyleSheet.create({
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontFamily: Font.semibold,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
});
