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
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing.md,
  },
  segmentWrap: {
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing.md,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  segmented: {
    flexDirection: 'row',
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    minHeight: 48,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  segmentActive: {
    borderBottomColor: Colors.primary,
  },
  segmentText: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
    color: Colors.textMuted,
  },
  segmentTextActive: {
    color: Colors.primary,
  },
  fill: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },
});
