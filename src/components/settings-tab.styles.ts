import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';

export const s = StyleSheet.create({
  hero: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  heroTitle: {
    fontFamily: Font.bold,
    fontSize: 26,
    color: Colors.text,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  heroHint: {
    fontFamily: Font.medium,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  heroInput: {
    fontFamily: Font.bold,
    fontSize: 26,
    color: Colors.text,
    lineHeight: 32,
    letterSpacing: -0.3,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  metaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  metaText: {
    fontFamily: Font.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  metaDivider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },

  rule: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.xl,
  },

  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontFamily: Font.semibold,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  countBadge: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontFamily: Font.bold,
    fontSize: 12,
    color: Colors.textMuted,
  },

  roster: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  playerRowLast: {
    borderBottomWidth: 0,
  },
  playerIndex: {
    fontFamily: Font.semibold,
    fontSize: 12,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    width: 26,
  },
  playerLine: {
    width: 1,
    height: 14,
    backgroundColor: Colors.borderLight,
    marginRight: Spacing.md,
  },
  playerName: {
    fontFamily: Font.regular,
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  playerAction: {
    fontFamily: Font.semibold,
    fontSize: 13,
    color: Colors.primary,
  },

  editCard: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: Spacing.xs,
  },
  editInput: {
    fontFamily: Font.regular,
    fontSize: 16,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  dangerZone: {
    marginTop: Spacing.xxxl,
    marginBottom: Spacing.xxl,
  },
  dangerRule: {
    height: 1,
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
    marginBottom: Spacing.lg,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  deleteX: {
    fontSize: 18,
    color: Colors.danger,
    fontFamily: Font.regular,
    opacity: 0.7,
    transform: [{ rotate: '45deg' }],
  },
  deleteText: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.danger,
  },
});
