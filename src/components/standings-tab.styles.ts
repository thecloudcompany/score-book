import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing, Type } from '@/constants/theme';

const numeric = { fontVariant: ['tabular-nums' as const] };

export const s = StyleSheet.create({
  captureArea: {
    backgroundColor: Colors.bg,
    padding: Spacing.md,
  },
  shareHeader: {
    marginBottom: Spacing.lg,
  },
  shareTitle: {
    fontFamily: Font.bold,
    fontSize: Type.section,
    color: Colors.text,
  },
  shareSubtitle: {
    fontFamily: Font.regular,
    fontSize: Type.meta,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: Font.medium,
    fontSize: Type.body,
    color: Colors.textMuted,
  },
  tableCard: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  th: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
    color: Colors.textSecondary,
  },
  td: {
    fontFamily: Font.medium,
    fontSize: Type.body,
    color: Colors.text,
    ...numeric,
  },
  colRank: {
    width: 24,
  },
  colPlayer: {
    flex: 1,
    minWidth: 0,
    paddingRight: Spacing.sm,
  },
  colStat: {
    width: 30,
    textAlign: 'right',
  },
  colDiff: {
    width: 46,
    textAlign: 'right',
  },
  tagText: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
    color: Colors.textMuted,
    marginTop: 2,
  },
  tagQualified: {
    color: Colors.primary,
  },
  qualifiedRow: {
    backgroundColor: Colors.primaryMuted,
  },
  poolSection: {
    marginBottom: Spacing.md,
  },
  poolTitle: {
    fontFamily: Font.bold,
    fontSize: Type.section,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  knockoutSection: {
    marginBottom: Spacing.xl,
  },
  knockoutSectionTitle: {
    fontFamily: Font.bold,
    fontSize: Type.section,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  championCard: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  championLabel: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  championName: {
    fontFamily: Font.extrabold,
    fontSize: Type.title,
    lineHeight: 32,
    color: Colors.primary,
  },
  runnerUp: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.xs,
  },
  runnerUpLabel: {
    fontFamily: Font.medium,
    fontSize: Type.meta,
    color: Colors.textSecondary,
  },
  runnerUpName: {
    fontFamily: Font.semibold,
    fontSize: Type.section,
    color: Colors.text,
    lineHeight: 24,
  },
  resultName: {
    fontFamily: Font.medium,
    fontSize: Type.body,
    color: Colors.text,
    lineHeight: 22,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  knockoutParticipantName: {
    fontFamily: Font.regular,
    fontSize: Type.body,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
});
