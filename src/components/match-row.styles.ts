import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing, Type } from '@/constants/theme';

export const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  rowBye: {
    opacity: 0.6,
  },
  players: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: Font.semibold,
    fontSize: Type.body,
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
    gap: 4,
  },
  score: {
    fontFamily: Font.bold,
    fontSize: Type.body,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  status: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
  },
});
