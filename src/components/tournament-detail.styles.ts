import { StyleSheet } from 'react-native';
import { Font, Colors, Spacing, Type } from '@/constants/theme';

export const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  notFoundTitle: {
    fontFamily: Font.bold,
    fontSize: Type.section,
    color: Colors.text,
  },
  notFoundHint: {
    fontFamily: Font.regular,
    fontSize: Type.body,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  backBtn: {
    marginTop: Spacing.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
  },
  backBtnText: {
    fontFamily: Font.semibold,
    fontSize: Type.body,
    color: Colors.primary,
  },
  shareError: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
    color: Colors.danger,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  nextStepWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  segmentWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  fill: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
  },
});
