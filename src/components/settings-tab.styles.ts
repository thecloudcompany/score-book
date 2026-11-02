import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';

export const s = StyleSheet.create({
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  name: {
    fontFamily: Font.bold,
    fontSize: 22,
    color: Colors.text,
    flexShrink: 1,
  },
  nameInput: {
    fontFamily: Font.bold,
    fontSize: 24,
    color: Colors.text,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    outlineWidth: 0,
  },
  rename: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: Font.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  section: {
    marginTop: Spacing.lg,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  sectionValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Font.bold,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
  },
  rowIndent: {
    paddingLeft: Spacing.xl,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: Font.semibold,
    fontSize: 15,
    color: Colors.text,
  },
  rowTitleIndent: {
    fontFamily: Font.regular,
  },
  rowSubtitle: {
    fontFamily: Font.regular,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rowValue: {
    fontFamily: Font.medium,
    fontSize: 14,
    color: Colors.textMuted,
  },
  rowAction: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.primary,
    marginLeft: Spacing.xs,
  },

  editor: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  editorLabel: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  editorInput: {
    fontFamily: Font.regular,
    fontSize: 16,
    color: Colors.text,
    height: 48,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    outlineWidth: 0,
  },
  editorActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  error: {
    fontFamily: Font.semibold,
    fontSize: 13,
    color: Colors.danger,
    marginTop: Spacing.sm,
  },
  ghostBtn: {
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

  deleteBtn: {
    alignItems: 'center',
    marginTop: Spacing.xxxl,
    paddingVertical: 14,
  },
  deleteText: {
    fontFamily: Font.semibold,
    fontSize: 15,
    color: Colors.danger,
  },
});
