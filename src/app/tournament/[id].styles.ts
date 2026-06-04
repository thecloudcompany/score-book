import { StyleSheet } from 'react-native';
import { Font, Colors, Spacing } from '@/constants/theme';

export const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 16,
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
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabText: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.textMuted,
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
});
