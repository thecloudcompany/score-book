import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing, Type } from '@/constants/theme';

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backText: {
    fontFamily: Font.semibold,
    fontSize: Type.body,
    color: Colors.primary,
    minWidth: 56,
  },
  headerTitle: {
    fontFamily: Font.bold,
    fontSize: Type.section,
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  headerAction: {
    minWidth: 56,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerActionText: {
    fontFamily: Font.semibold,
    fontSize: Type.body,
    color: Colors.primary,
  },
  nextStepWrap: {
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  segmentWrap: {
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    padding: 3,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: Radius.xs,
  },
  segmentActive: {
    backgroundColor: Colors.bgElevated,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentText: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
    color: Colors.textMuted,
  },
  segmentTextActive: {
    color: Colors.text,
  },
  fill: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
});
