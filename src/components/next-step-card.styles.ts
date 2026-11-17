import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing, Type } from '@/constants/theme';

export const s = StyleSheet.create({
  card: {
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: Font.bold,
    fontSize: Type.section,
    lineHeight: 24,
    color: Colors.text,
  },
  championLabel: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
    color: Colors.textSecondary,
  },
  championName: {
    fontFamily: Font.bold,
    fontSize: Type.title,
    lineHeight: 32,
    color: Colors.primary,
    marginTop: Spacing.xs,
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
    borderRadius: Radius.sm,
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
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryText: {
    fontFamily: Font.semibold,
    fontSize: 16,
    color: Colors.primary,
  },
});
