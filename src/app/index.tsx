import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTournaments } from '@/hooks/use-tournaments';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ContentContainer } from '@/components/content-container';
import { Font, Colors, Radius, Spacing, statusColor } from '@/constants/theme';
import type { Tournament } from '@/types';

const TOURNAMENT_LIST_MAX_WIDTH = 960;
const GRID_GAP = Spacing.lg;

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

const SPORT_LABELS: Record<Tournament['sport'], string> = {
  badminton: 'Badminton',
  tennis: 'Tennis',
  table_tennis: 'Table Tennis',
  pickleball: 'Pickleball',
};

function formatTournamentStatus(status: Tournament['status']): string {
  switch (status) {
    case 'active':
      return 'Live';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'upcoming':
    default:
      return 'Upcoming';
  }
}

function TournamentCard({
  tournament,
  onPress,
  onLongPress,
  style,
}: {
  tournament: Tournament;
  onPress: () => void;
  onLongPress: () => void;
  style?: import('react-native').ViewStyle;
}) {
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardTop}>
        <View style={styles.sportRow}>
          <Text style={styles.sportLabel} numberOfLines={1}>{SPORT_LABELS[tournament.sport]}</Text>
          <View style={styles.sportDivider} />
          <Text style={styles.typeLabel} numberOfLines={1}>
            {tournament.type === 'knockout' ? 'Knockout' : 'Round robin'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <StatusDot status={tournament.status} />
          <Text style={[styles.statusText, { color: statusColor(tournament.status) }]} numberOfLines={1}>
            {formatTournamentStatus(tournament.status)}
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
  const { width } = useWindowDimensions();
  const { tournaments, refresh, deleteTournament } = useTournaments();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const horizontalPad = width < 380 ? Spacing.lg : Spacing.xl;
  const availableListWidth = Math.min(Math.max(width - horizontalPad * 2, 0), TOURNAMENT_LIST_MAX_WIDTH);
  const gridColumns = availableListWidth >= 760 ? 2 : 1;
  const cardWidth = gridColumns === 1
    ? '100%'
    : (availableListWidth - GRID_GAP) / gridColumns;

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
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <ContentContainer maxWidth={TOURNAMENT_LIST_MAX_WIDTH} style={[styles.headerContent, { paddingHorizontal: horizontalPad }]}>
          <Text style={styles.title}>ScoreBook</Text>
          <Text style={styles.subtitle}>
            {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''}
          </Text>
        </ContentContainer>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: horizontalPad }]}
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
          <ContentContainer maxWidth={TOURNAMENT_LIST_MAX_WIDTH}>
            <View style={styles.grid}>
              {tournaments.map((t) => (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  onPress={() => router.push(`/tournament/${t.id}`)}
                  onLongPress={() => setDeleteTarget({ id: t.id, name: t.name })}
                  style={{ width: cardWidth }}
                />
              ))}
            </View>
          </ContentContainer>
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
    paddingTop: 18,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerContent: {
    paddingHorizontal: Spacing.xl,
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
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
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
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  sportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
    minWidth: 100,
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
    flexShrink: 0,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  statusText: {
    fontFamily: Font.semibold,
    fontSize: 12,
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
