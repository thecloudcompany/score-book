import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  section: {
    marginTop: Spacing.lg,
  },
  label: {
    fontFamily: Font.semibold,
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  input: {
    fontFamily: Font.regular,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  error: {
    fontFamily: Font.medium,
    fontSize: 13,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  sportRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sportBtn: {
    flex: 1,
    borderRadius: Radius.sm,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sportBtnActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  sportEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  sportText: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sportTextActive: {
    color: Colors.primary,
  },
  formatRow: {
    flexDirection: 'row',
    gap: 8,
  },
  formatBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formatBtnActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  formatBtnText: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  formatBtnTextActive: {
    color: Colors.primary,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    paddingVertical: 8,
  },
  advancedText: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  advancedArrow: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  advancedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  advancedLabel: {
    fontFamily: Font.medium,
    fontSize: 15,
    color: Colors.text,
  },
  advancedInput: {
    fontFamily: Font.regular,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: 80,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    borderRadius: Radius.sm,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeBtnActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  typeText: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  typeTextActive: {
    color: Colors.primary,
  },
  typeDescription: {
    fontFamily: Font.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
});
