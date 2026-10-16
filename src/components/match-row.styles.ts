import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';

export const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    paddingVertical: 15,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowBye: {
    opacity: 0.6,
    backgroundColor: Colors.surface,
  },
  rowLocked: {
    opacity: 0.55,
  },
  lockedNote: {
    fontFamily: Font.medium,
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  players: {
    fontFamily: Font.semibold,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 2,
  },
  vs: {
    fontFamily: Font.medium,
    fontSize: 13,
    color: Colors.textMuted,
  },
  byeText: {
    fontFamily: Font.medium,
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  tbdText: {
    fontFamily: Font.medium,
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  preview: {
    fontFamily: Font.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
});
