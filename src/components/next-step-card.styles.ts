import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Shadow, Spacing, Type } from '@/constants/theme';

export const s = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    ...Shadow.card,
  },
  cardWin: { padding: Spacing.xl, backgroundColor: Colors.primaryDark, borderColor: Colors.primaryDark, borderTopWidth: 3, borderTopColor: Colors.gold },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepIcon: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryMuted },
  title: {
    flex: 1,
    fontFamily: Font.bold,
    fontSize: Type.section,
    lineHeight: 24,
    color: Colors.text,
  },
  champHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  crown: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(227,179,65,0.2)' },
  championLabel: {
    fontFamily: Font.bold,
    fontSize: Type.meta + 1,
    color: Colors.gold,
  },
  championName: {
    fontFamily: Font.extrabold,
    fontSize: 28,
    lineHeight: 34,
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginTop: Spacing.sm,
  },
  pairs: {
    maxHeight: 160,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  pair: {
    fontFamily: Font.medium,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 6,
  },
  vs: {
    fontFamily: Font.regular,
    color: Colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  primaryBtn: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: Font.bold,
    fontSize: 16,
    color: Colors.textInverse,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryText: {
    fontFamily: Font.semibold,
    fontSize: 16,
    color: Colors.primary,
  },
});
