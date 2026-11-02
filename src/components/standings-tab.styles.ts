import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing, Type } from '@/constants/theme';

const numeric = { fontVariant: ['tabular-nums' as const] };

export const s = StyleSheet.create({
  captureArea: {
    backgroundColor: Colors.bg,
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
    color: Colors.textMuted,
    marginTop: 2,
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
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
    width: 40,
  },
  colPlayer: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  colStat: {
    width: 36,
    textAlign: 'right',
  },
  colDiff: {
    width: 52,
    textAlign: 'right',
  },
  colTag: {
    width: 84,
    textAlign: 'right',
  },
  tagText: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  tagQualified: {
    color: Colors.primary,
  },
  poolSection: {
    marginBottom: Spacing.xxl,
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
  knockoutParticipantCard: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    marginBottom: Spacing.sm,
  },
  knockoutParticipantCardEliminated: {
    opacity: 0.55,
  },
  knockoutParticipantName: {
    fontFamily: Font.semibold,
    fontSize: Type.body,
    color: Colors.text,
  },
});
