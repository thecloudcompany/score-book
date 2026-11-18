import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing, Type } from '@/constants/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  backBtn: { width: 42, height: 42, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.borderLight },
  lead: { fontFamily: Font.regular, fontSize: Type.body, lineHeight: 22, color: Colors.textSecondary, marginTop: Spacing.sm },
  toggleText: { fontFamily: Font.semibold, fontSize: Type.body, color: Colors.text },
  toggleRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerAction: { minHeight: 48, justifyContent: 'center' },
  backText: { fontFamily: Font.semibold, fontSize: Type.body, color: Colors.primary },
  headerTitle: { fontFamily: Font.extrabold, fontSize: Type.section, color: Colors.text },
  content: { flex: 1 },
  footer: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
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
