import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing, Type } from '@/constants/theme';

export const s = StyleSheet.create({
  listContent: { paddingBottom: Spacing.xxl },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Font.semibold,
    fontSize: Type.meta + 1,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  searchWrap: {
    backgroundColor: Colors.bg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchIcon: { position: 'absolute', left: 16, zIndex: 1 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  searchSummary: {
    fontFamily: Font.regular,
    fontSize: Type.meta,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    fontFamily: Font.regular,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    paddingLeft: 44,
    paddingRight: 14,
    paddingVertical: 11,
    borderWidth: 1,
  },
  searchClear: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchClearText: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
    color: Colors.primary,
  },
  emptyText: {
    fontFamily: Font.regular,
    fontSize: Type.body,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  groupToggle: {
    minHeight: 48,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  groupToggleText: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
    color: Colors.primary,
  },
});
