import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing, Type } from '@/constants/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerAction: { minHeight: 48, justifyContent: 'center' },
  backText: { fontFamily: Font.semibold, fontSize: Type.body, color: Colors.primary },
  headerTitle: { fontFamily: Font.bold, fontSize: Type.section, color: Colors.text },
  content: { flex: 1 },
  footer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    minHeight: 48,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnText: { fontFamily: Font.bold, fontSize: Type.body, color: Colors.textInverse },
  formError: { fontFamily: Font.semibold, fontSize: Type.meta, color: Colors.danger, marginTop: Spacing.sm },
  drawToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    marginTop: Spacing.lg,
  },
  hint: { fontFamily: Font.regular, fontSize: Type.meta, color: Colors.textSecondary },
});
