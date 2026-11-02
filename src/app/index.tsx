import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTournaments } from '@/hooks/use-tournaments';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ContentContainer } from '@/components/content-container';
import { Font, Colors, Radius, Spacing, Type, statusColor } from '@/constants/theme';
import { SPORT_LABELS, playFormatLabel, statusLabel } from '@/lib/tournament-labels';
import type { Tournament } from '@/types';

const LIST_MAX_WIDTH = 720;

function TournamentCard({
  tournament,
  onPress,
  onDelete,
}: {
  tournament: Tournament;
  onPress: () => void;
  onDelete: () => void;
}) {
  const status = statusLabel(tournament.status);
  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Open ${tournament.name}, ${status}`}
      >
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {tournament.name}
          </Text>
          <Text style={[styles.cardStatus, { color: statusColor(tournament.status) }]}>{status}</Text>
        </View>
        <Text style={styles.cardMeta}>
          {SPORT_LABELS[tournament.sport]}, {playFormatLabel(tournament)}
        </Text>
      </TouchableOpacity>
      <View style={styles.cardFooter}>
        <TouchableOpacity
          onPress={onDelete}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${tournament.name}`}
          style={styles.cardDelete}
        >
          <Text style={styles.cardDeleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TournamentListScreen() {
  const router = useRouter();
  const { tournaments, refresh, deleteTournament, deleteAllTournaments } = useTournaments();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const count = tournaments.length;

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleCreate = useCallback(() => {
    router.push('/create');
  }, [router]);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteTournament(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteTournament]);

  const confirmDeleteEvery = useCallback(() => {
    deleteAllTournaments();
    setConfirmDeleteAll(false);
  }, [deleteAllTournaments]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.headerWrap}>
        <ContentContainer maxWidth={LIST_MAX_WIDTH}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Tournaments</Text>
              <Text style={styles.subtitle}>
                {count === 0 ? 'Nothing scheduled yet' : `${count} tournament${count === 1 ? '' : 's'}`}
              </Text>
            </View>
            {count > 0 && (
              <TouchableOpacity
                onPress={() => setConfirmDeleteAll(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Delete all tournaments"
                style={styles.clearAll}
              >
                <Text style={styles.clearAllText}>Delete all</Text>
              </TouchableOpacity>
            )}
          </View>
        </ContentContainer>
      </View>

      {count === 0 ? (
        <View style={styles.empty}>
          <ContentContainer maxWidth={LIST_MAX_WIDTH}>
            <Text style={styles.emptyTitle}>No tournaments yet</Text>
            <Text style={styles.emptyBody}>
              Create one to start keeping score. You can choose how players play next.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleCreate} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Create a tournament</Text>
            </TouchableOpacity>
          </ContentContainer>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <ContentContainer maxWidth={LIST_MAX_WIDTH}>
            {tournaments.map((t) => (
              <TournamentCard
                key={t.id}
                tournament={t}
                onPress={() => router.push(`/tournament/${t.id}`)}
                onDelete={() => setDeleteTarget({ id: t.id, name: t.name })}
              />
            ))}
          </ContentContainer>
        </ScrollView>
      )}

      {count > 0 && (
        <View style={styles.footer}>
          <ContentContainer maxWidth={LIST_MAX_WIDTH}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleCreate} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>New tournament</Text>
            </TouchableOpacity>
          </ContentContainer>
        </View>
      )}

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete tournament"
        message={deleteTarget ? `Permanently delete "${deleteTarget.name}"?` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        visible={confirmDeleteAll}
        title="Delete all tournaments?"
        message={`Permanently delete all ${count} tournament${count === 1 ? '' : 's'}, including their players and scores?`}
        confirmText="Delete all"
        cancelText="Cancel"
        destructive
        onConfirm={confirmDeleteEvery}
        onCancel={() => setConfirmDeleteAll(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  headerWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: Font.bold,
    fontSize: Type.title,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: Font.regular,
    fontSize: Type.meta,
    color: Colors.textMuted,
    marginTop: 2,
  },
  clearAll: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  clearAllText: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
    color: Colors.danger,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 16,
    marginBottom: Spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  cardTitle: {
    flex: 1,
    fontFamily: Font.bold,
    fontSize: Type.section,
    color: Colors.text,
  },
  cardStatus: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
  },
  cardMeta: {
    fontFamily: Font.regular,
    fontSize: Type.meta,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
  },
  cardDelete: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
  },
  cardDeleteText: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
    color: Colors.danger,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontFamily: Font.bold,
    fontSize: Type.section,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyBody: {
    fontFamily: Font.regular,
    fontSize: Type.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: Font.bold,
    fontSize: Type.body,
    color: Colors.textInverse,
  },
});
