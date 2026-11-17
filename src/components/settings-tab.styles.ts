import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';

export const s = StyleSheet.create({
  header: {
    paddingTop: 0,
    paddingBottom: Spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    gap: Spacing.sm,
  },
  name: {
    fontFamily: Font.bold,
    fontSize: 17,
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
  inlineAction: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },

  section: {
    marginTop: Spacing.md,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  accordionHead: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  chevron: {
    fontFamily: Font.regular,
    fontSize: 11,
    color: Colors.textMuted,
  },
  addIconBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
  },
  addIconText: {
    fontFamily: Font.bold,
    fontSize: 20,
    lineHeight: 22,
    color: Colors.primary,
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
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },

  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: 0,
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
    borderRadius: Radius.sm,
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
