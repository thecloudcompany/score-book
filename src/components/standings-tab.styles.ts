import { StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';

export const s = StyleSheet.create({
  captureArea: {
    backgroundColor: Colors.bg,
    padding: 4,
    borderRadius: Radius.sm,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: Font.medium,
    fontSize: 15,
    color: Colors.textMuted,
  },
  tableCard: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  th: {
    fontFamily: Font.semibold,
    fontSize: 12,
    color: Colors.textMuted,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    alignItems: 'center',
  },
  td: {
    fontFamily: Font.medium,
    fontSize: 14,
    color: Colors.text,
  },
  knockoutSection: {
    marginBottom: Spacing.xl,
  },
  knockoutSectionTitle: {
    fontFamily: Font.semibold,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  knockoutParticipantCard: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  knockoutParticipantCardEliminated: {
    opacity: 0.6,
  },
  knockoutParticipantName: {
    fontFamily: Font.medium,
    fontSize: 15,
    color: Colors.text,
  },
});
