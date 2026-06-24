import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTournaments } from '@/hooks/use-tournaments';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Font, Colors, Radius, Spacing, statusColor } from '@/constants/theme';
import type { Tournament } from '@/types';

function StatusDot({ status }: { status: Tournament['status'] }) {
  return (
    <View
      style={[
        styles.statusDot,
        { backgroundColor: statusColor(status) },
      ]}
    />
  );
}

function TournamentCard({
  tournament,
  onPress,
  onLongPress,
}: {
  tournament: Tournament;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const isBadminton = tournament.sport === 'badminton';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardTop}>
        <View style={styles.sportRow}>
          <Text style={styles.sportLabel}>{isBadminton ? 'Badminton' : 'Tennis'}</Text>
          <View style={styles.sportDivider} />
          <Text style={styles.typeLabel}>
            {tournament.type === 'knockout' ? 'Knockout' : 'Round robin'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <StatusDot status={tournament.status} />
          <Text style={[styles.statusText, { color: statusColor(tournament.status) }]}>
            {tournament.status === 'active' ? 'Live' : tournament.status}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle} numberOfLines={1}>
        {tournament.name}
      </Text>
    </TouchableOpacity>
  );
}

export default function TournamentListScreen() {
  const router = useRouter();
  const { tournaments, refresh, deleteTournament } = useTournaments();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

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

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>ScoreBook</Text>
        <Text style={styles.subtitle}>
          {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {tournaments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏸</Text>
            <Text style={styles.emptyTitle}>No tournaments yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first tournament to start tracking scores
            </Text>
            <TouchableOpacity style={styles.emptyCta} onPress={handleCreate} activeOpacity={0.8}>
              <Text style={styles.emptyCtaText}>Create Tournament</Text>
            </TouchableOpacity>
          </View>
        ) : (
          tournaments.map((t) => (
            <TournamentCard
              key={t.id}
              tournament={t}
              onPress={() => router.push(`/tournament/${t.id}`)}
              onLongPress={() => setDeleteTarget({ id: t.id, name: t.name })}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleCreate} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Tournament"
        message={deleteTarget ? `Permanently delete "${deleteTarget.name}"?` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 18,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontFamily: Font.black,
    fontSize: 28,
    color: Colors.text,
    letterSpacing: 0,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: Font.medium,
    fontSize: 14,
    color: Colors.textMuted,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 100,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sportLabel: {
    fontFamily: Font.semibold,
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sportDivider: {
    width: 1,
    height: 10,
    backgroundColor: Colors.border,
    marginHorizontal: 2,
  },
  typeLabel: {
    fontFamily: Font.medium,
    fontSize: 12,
    color: Colors.textMuted,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: Font.semibold,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  cardTitle: {
    fontFamily: Font.bold,
    fontSize: 18,
    color: Colors.text,
    letterSpacing: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: Spacing.lg,
  },
  emptyEmoji: {
    fontSize: 42,
    opacity: 0.35,
  },
  emptyTitle: {
    fontFamily: Font.bold,
    fontSize: 18,
    color: Colors.text,
  },
  emptySubtitle: {
    fontFamily: Font.medium,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  emptyCta: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
  },
  emptyCtaText: {
    fontFamily: Font.bold,
    fontSize: 15,
    color: Colors.textInverse,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: Spacing.xl,
    width: 52,
    height: 52,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  fabText: {
    fontSize: 24,
    color: Colors.textInverse,
    fontWeight: '300',
    lineHeight: 26,
  },
});
