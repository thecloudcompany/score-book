import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing, Type } from '@/constants/theme';

export const s = StyleSheet.create({
  listContent: { paddingBottom: Spacing.xxl },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Font.bold,
    fontSize: Type.section,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  searchWrap: {
    backgroundColor: Colors.bg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  searchLabel: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
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
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
  },
  searchClear: {
    minWidth: 48,
    height: 48,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
  },
  groupToggleText: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
    color: Colors.primary,
  },
});
