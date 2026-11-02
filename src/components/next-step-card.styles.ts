import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';

export const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Font.bold,
    fontSize: 17,
    color: Colors.text,
  },
  progressBlock: {
    marginTop: Spacing.sm,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  pairs: {
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
    marginTop: Spacing.lg,
  },
  primaryBtn: {
    flex: 1,
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
