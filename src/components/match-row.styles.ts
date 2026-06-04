import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';

export const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  rowBye: {
    opacity: 0.6,
    backgroundColor: Colors.surface,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  players: {
    fontFamily: Font.semibold,
    fontSize: 15,
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
    color: Colors.textMuted,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
