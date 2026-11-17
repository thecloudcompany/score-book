import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';

export const s = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
    gap: Spacing.md,
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
    width: 48,
    height: 48,
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
    minHeight: 48,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
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
  disabled: {
    opacity: 0.4,
  },
  path: {
    fontFamily: Font.medium,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.primary,
  },
});
