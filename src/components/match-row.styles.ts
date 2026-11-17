import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing, Type } from '@/constants/theme';

export const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    minHeight: 80,
    gap: Spacing.md,
  },
  rowBye: {
    opacity: 0.6,
  },
  rowInProgress: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  players: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  name: {
    fontFamily: Font.semibold,
    fontSize: Type.body,
    lineHeight: 22,
    color: Colors.text,
  },
  nameMuted: {
    fontFamily: Font.regular,
    color: Colors.textMuted,
  },
  note: {
    fontFamily: Font.regular,
    fontSize: Type.meta,
    color: Colors.textMuted,
    marginTop: 2,
  },
  side: {
    alignItems: 'flex-end',
    maxWidth: '45%',
    gap: 4,
  },
  score: {
    fontFamily: Font.bold,
    fontSize: Type.section,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  status: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
});
