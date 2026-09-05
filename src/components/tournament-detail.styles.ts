import { StyleSheet } from 'react-native';
import { Font, Colors, Spacing } from '@/constants/theme';

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
    gap: 8,
  },
  notFoundTitle: {
    fontFamily: Font.bold,
    fontSize: 18,
    color: Colors.text,
  },
  notFoundHint: {
    fontFamily: Font.regular,
    fontSize: 14,
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
    fontSize: 15,
    color: Colors.primary,
  },
  shareError: {
    fontFamily: Font.semibold,
    fontSize: 13,
    color: Colors.danger,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backText: {
    fontFamily: Font.semibold,
    fontSize: 15,
    color: Colors.primary,
    width: 60,
  },
  headerTitle: {
    fontFamily: Font.bold,
    fontSize: 17,
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerAction: {
    width: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerActionText: {
    fontSize: 20,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.bgElevated,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabText: {
    fontFamily: Font.semibold,
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tabTextActive: {
    color: Colors.text,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 24,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  wideRow: {
    flex: 1,
    flexDirection: 'row',
  },
  sideRail: {
    width: 180,
    borderRightWidth: 1,
    borderRightColor: Colors.borderLight,
    backgroundColor: Colors.bgElevated,
    paddingVertical: Spacing.md,
  },
  railItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    position: 'relative',
  },
  railEmoji: {
    fontSize: 18,
  },
  railLabel: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.textMuted,
  },
  railLabelActive: {
    color: Colors.text,
  },
  railIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Colors.primary,
  },
  contentWide: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    alignSelf: 'flex-start',
  },
});
