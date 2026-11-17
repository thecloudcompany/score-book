import { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTournaments } from '@/hooks/use-tournaments';
import { ContentContainer } from '@/components/content-container';
import { Font, Colors, Radius, Spacing, Type, statusColor } from '@/constants/theme';
import { SPORT_LABELS, playFormatLabel, statusLabel } from '@/lib/tournament-labels';
import type { Tournament } from '@/types';

const LIST_MAX_WIDTH = 720;

function TournamentCard({
  tournament,
  onPress,
}: {
  tournament: Tournament;
  onPress: () => void;
}) {
  const status = statusLabel(tournament.status);
  return (
      <TouchableOpacity
        style={styles.card}
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
  );
}

export default function TournamentListScreen() {
  const router = useRouter();
  const { tournaments, refresh } = useTournaments();
  const count = tournaments.length;

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleCreate = useCallback(() => {
    router.push('/create');
  }, [router]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.headerWrap}>
        <ContentContainer maxWidth={LIST_MAX_WIDTH}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Scorebook</Text>
            </View>
            {count > 0 && (
              <TouchableOpacity style={[styles.primaryBtn, styles.newButton]} onPress={handleCreate} accessibilityRole="button">
                <Text style={styles.newButtonText}>New tournament</Text>
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
              Add players to get started.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleCreate} activeOpacity={0.85} accessibilityRole="button">
               <Text style={styles.primaryBtnText}>New tournament</Text>
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
            {[
              { title: 'In play', items: tournaments.filter((t) => t.status !== 'completed') },
              { title: 'Finished', items: tournaments.filter((t) => t.status === 'completed') },
            ].map(({ title, items }) => items.length > 0 && (
              <View key={title}>
                <Text style={styles.listHeading}>{title}</Text>
                {items.map((t) => (
                  <TournamentCard
                    key={t.id}
                    tournament={t}
                    onPress={() => router.push(`/tournament/${t.id}`)}
                  />
                ))}
              </View>
            ))}
          </ContentContainer>
        </ScrollView>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  headerWrap: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  listHeading: {
    fontFamily: Font.semibold,
    fontSize: Type.meta,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.bgElevated,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 0,
    paddingVertical: 10,
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
    marginTop: 2,
  },
  empty: {
    flex: 1,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
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
    marginBottom: Spacing.md,
  },
  newButton: { paddingHorizontal: Spacing.md },
  newButtonText: { fontFamily: Font.bold, fontSize: Type.meta, color: Colors.textInverse },
  primaryBtn: {
    minHeight: 48,
    justifyContent: 'center',
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
