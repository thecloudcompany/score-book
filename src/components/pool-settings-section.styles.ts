import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';

export const s = StyleSheet.create({
  intro: {
    fontFamily: Font.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontFamily: Font.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.text,
  },
  body: {
    paddingVertical: Spacing.sm,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontFamily: Font.semibold,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  hint: {
    fontFamily: Font.regular,
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  suggested: {
    fontFamily: Font.regular,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  error: {
    fontFamily: Font.medium,
    fontSize: 13,
    color: Colors.danger,
    marginBottom: Spacing.md,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontFamily: Font.semibold,
    fontSize: 18,
    color: Colors.primary,
  },
  stepValue: {
    fontFamily: Font.bold,
    fontSize: 16,
    color: Colors.text,
    minWidth: 28,
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.bgElevated,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  chipText: {
    fontFamily: Font.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    fontFamily: Font.semibold,
    color: Colors.primary,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  primaryText: {
    fontFamily: Font.bold,
    fontSize: 15,
    color: Colors.textInverse,
  },
  disabled: {
    opacity: 0.4,
  },
});
