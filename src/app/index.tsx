import { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTournaments } from '@/hooks/use-tournaments';
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
          <Text style={styles.sportEmoji}>{isBadminton ? '🏸' : '🎾'}</Text>
          <Text style={styles.sportLabel}>{isBadminton ? 'Badminton' : 'Tennis'}</Text>
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

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleCreate = useCallback(() => {
    router.push('/create');
  }, [router]);

  const handleDelete = useCallback(
    (id: number, name: string) => {
      Alert.alert(
        'Delete Tournament',
        `Permanently delete "${name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteTournament(id),
          },
        ]
      );
    },
    [deleteTournament]
  );

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
              onLongPress={() =>
                Alert.alert(t.name, undefined, [
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => handleDelete(t.id, t.name),
                  },
                  { text: 'Cancel', style: 'cancel' },
                ])
              }
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleCreate} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    paddingTop: 16,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontFamily: Font.black,
    fontSize: 26,
    color: Colors.text,
    letterSpacing: -0.5,
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
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
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
  sportEmoji: {
    fontSize: 14,
  },
  sportLabel: {
    fontFamily: Font.semibold,
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    fontSize: 17,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: Spacing.lg,
  },
  emptyEmoji: {
    fontSize: 48,
    opacity: 0.4,
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
    borderRadius: Radius.md,
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
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
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
