import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';

export const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '100%',
    alignSelf: 'center',
    backgroundColor: Colors.bgElevated,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontFamily: Font.bold,
    fontSize: 18,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  list: {
    maxHeight: 320,
    flexShrink: 1,
  },
  keyboard: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  input: {
    fontFamily: Font.regular,
    fontSize: 16,
    color: Colors.text,
    height: 48,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  addMore: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  addMoreText: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.primary,
  },
  error: {
    fontFamily: Font.semibold,
    fontSize: 13,
    color: Colors.danger,
    marginTop: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  ghostBtn: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghostText: {
    fontFamily: Font.semibold,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  primaryBtn: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
  },
  primaryText: {
    fontFamily: Font.bold,
    fontSize: 15,
    color: Colors.textInverse,
  },
});
