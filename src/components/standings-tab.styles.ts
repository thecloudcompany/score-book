import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Shadow, Spacing, Type } from '@/constants/theme';

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
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.card,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
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
    width: 28,
  },
  rankHead: { textAlign: 'center' },
  rankBadge: { height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  rankText: { fontFamily: Font.bold, fontSize: Type.meta, color: Colors.textSecondary, fontVariant: ['tabular-nums' as const] },
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
    fontSize: Type.meta + 1,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  knockoutSection: {
    marginBottom: Spacing.xl,
  },
  knockoutSectionTitle: {
    fontFamily: Font.bold,
    fontSize: Type.meta + 1,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  championCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.lg,
    borderTopWidth: 3,
    borderTopColor: Colors.gold,
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
    overflow: 'hidden',
  },
  championHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.sm },
  crown: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(227,179,65,0.2)' },
  championLabel: {
    fontFamily: Font.bold,
    fontSize: Type.meta + 1,
    color: Colors.gold,
  },
  championName: {
    fontFamily: Font.extrabold,
    fontSize: 28,
    lineHeight: 34,
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  runnerUp: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.16)',
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.xs,
  },
  runnerUpLabel: {
    fontFamily: Font.medium,
    fontSize: Type.meta,
    color: 'rgba(255,255,255,0.65)',
  },
  runnerUpName: {
    fontFamily: Font.semibold,
    fontSize: Type.section,
    color: '#FFFFFF',
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
