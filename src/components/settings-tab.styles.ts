import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';

export const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  label: {
    fontFamily: Font.semibold,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  value: {
    fontFamily: Font.regular,
    fontSize: 16,
    color: Colors.text,
  },
  input: {
    fontFamily: Font.regular,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  playerText: {
    fontFamily: Font.regular,
    fontSize: 16,
    color: Colors.text,
  },
  playerHint: {
    fontFamily: Font.medium,
    fontSize: 13,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  deleteBtn: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
  },
  deleteBtnText: {
    fontFamily: Font.semibold,
    fontSize: 15,
    color: Colors.danger,
  },
});
