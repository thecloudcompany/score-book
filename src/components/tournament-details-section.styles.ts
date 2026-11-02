import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  section: {
    marginTop: Spacing.lg,
  },
  label: {
    fontFamily: Font.semibold,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    fontFamily: Font.regular,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    outlineColor: Colors.primary,
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
    flexWrap: 'wrap',
    gap: 6,
  },
  sportBtn: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 120,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    outlineColor: Colors.primary,
  },
  sportBtnActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  sportText: {
    fontFamily: Font.semibold,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
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
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formatBtnActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  formatBtnText: {
    fontFamily: Font.semibold,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
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
  optionList: {
    gap: 6,
  },
  optionCard: {
    borderRadius: Radius.sm,
    paddingVertical: 11,
    paddingHorizontal: 14,
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
    fontSize: 15,
    color: Colors.textSecondary,
  },
  typeTextActive: {
    color: Colors.primary,
  },
});
