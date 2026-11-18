import { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated from 'react-native-reanimated';
import { Plus, ChevronRight, Trophy } from 'lucide-react-native';
import { useTournaments } from '@/hooks/use-tournaments';
import { ContentContainer } from '@/components/content-container';
import { PressableScale } from '@/components/ui/pressable-scale';
import { PrimaryButton } from '@/components/ui/primary-button';
import { CourtLines } from '@/components/ui/court-lines';
import { SportIcon } from '@/components/ui/sport-icon';
import { enterRise, enterFade } from '@/components/ui/motion';
import { Font, Colors, Radius, Shadow, Spacing, Type, statusColor } from '@/constants/theme';
import { SPORT_LABELS, playFormatLabel, statusLabel } from '@/lib/tournament-labels';
import type { Tournament } from '@/types';

const LIST_MAX_WIDTH = 720;

function TournamentCard({ tournament, index, onPress }: { tournament: Tournament; index: number; onPress: () => void }) {
  const status = statusLabel(tournament.status);
  const color = statusColor(tournament.status);
  return (
    <Animated.View entering={enterRise(index)}>
      <PressableScale
        style={[styles.card, Shadow.card]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Open ${tournament.name}, ${status}`}
      >
        <SportIcon sport={tournament.sport} />
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{tournament.name}</Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {SPORT_LABELS[tournament.sport]} · {playFormatLabel(tournament)}
          </Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.statusText, { color }]}>{status}</Text>
          </View>
        </View>
        <ChevronRight size={20} color={Colors.textMuted} />
      </PressableScale>
    </Animated.View>
  );
}

export default function TournamentListScreen() {
  const router = useRouter();
  const { tournaments, refresh } = useTournaments();
  const count = tournaments.length;
  const live = tournaments.filter((t) => t.status !== 'completed').length;
  const headline = live > 0 ? live : count;

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  const handleCreate = useCallback(() => { router.push('/create'); }, [router]);

  const sections = [
    { title: 'In play', items: tournaments.filter((t) => t.status !== 'completed') },
    { title: 'Finished', items: tournaments.filter((t) => t.status === 'completed') },
  ];
  let cardIndex = 0;

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <CourtLines />
        <SafeAreaView edges={['top', 'left', 'right']}>
          <ContentContainer maxWidth={LIST_MAX_WIDTH}>
            <Animated.View entering={enterFade()} style={styles.heroInner}>
              <View style={styles.heroRow}>
                <Trophy size={18} color={Colors.gold} strokeWidth={2.2} />
                <Text style={styles.brand}>Scorebook</Text>
              </View>
              {count === 0 ? (
                <Text style={styles.heroTitle}>Your first tournament starts here</Text>
              ) : (
                <View style={styles.bigRow}>
                  <Text style={styles.bigNumber}>{headline}</Text>
                  <Text style={styles.bigLabel}>{`${headline === 1 ? 'tournament' : 'tournaments'}\n${live > 0 ? 'in play' : 'finished'}`}</Text>
                </View>
              )}
              <Text style={styles.heroSub}>
                {count === 0 ? 'Fixtures, scores and standings. Works offline.' : live > 0 ? `${count - live} finished` : 'All wrapped up. Start another any time.'}
              </Text>
            </Animated.View>
          </ContentContainer>
        </SafeAreaView>
      </View>

      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.sheet}>
        {count === 0 ? (
          <View style={styles.empty}>
            <ContentContainer maxWidth={LIST_MAX_WIDTH}>
              <Animated.View entering={enterRise(0)} style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No tournaments yet</Text>
                <Text style={styles.emptyBody}>Add your players and Scorebook builds every fixture, keeps each score and updates the table.</Text>
                <PrimaryButton label="New tournament" onPress={handleCreate} icon={<Plus size={20} color="#fff" strokeWidth={2.6} />} />
              </Animated.View>
            </ContentContainer>
          </View>
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
              <ContentContainer maxWidth={LIST_MAX_WIDTH}>
                {sections.map(({ title, items }) => items.length > 0 && (
                  <View key={title}>
                    <Text style={styles.listHeading}>{title}</Text>
                    {items.map((t) => (
                      <TournamentCard key={t.id} tournament={t} index={cardIndex++} onPress={() => router.push(`/tournament/${t.id}`)} />
                    ))}
                  </View>
                ))}
              </ContentContainer>
            </ScrollView>
            <Animated.View entering={enterFade(300)} style={styles.fabWrap} pointerEvents="box-none">
              <ContentContainer maxWidth={LIST_MAX_WIDTH} style={styles.fabInner}>
                <PrimaryButton label="New tournament" onPress={handleCreate} icon={<Plus size={20} color="#fff" strokeWidth={2.6} />} />
              </ContentContainer>
            </Animated.View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  hero: { backgroundColor: Colors.primaryDark, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl, overflow: 'hidden', borderBottomWidth: 3, borderBottomColor: Colors.gold },
  heroInner: { paddingTop: Spacing.md },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  brand: { fontFamily: Font.bold, fontSize: Type.body, color: 'rgba(255,255,255,0.88)', letterSpacing: 0.3 },
  bigRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: Spacing.xl },
  bigNumber: { fontFamily: Font.extrabold, fontSize: 72, lineHeight: 72, color: '#fff', letterSpacing: -3, fontVariant: ['tabular-nums'] },
  bigLabel: { fontFamily: Font.semibold, fontSize: Type.body, lineHeight: 20, color: 'rgba(255,255,255,0.8)', paddingBottom: 8 },
  heroTitle: { fontFamily: Font.extrabold, fontSize: 30, lineHeight: 36, color: '#fff', marginTop: Spacing.xl, letterSpacing: -0.6, maxWidth: 280 },
  heroSub: { fontFamily: Font.medium, fontSize: Type.meta + 1, color: 'rgba(255,255,255,0.7)', marginTop: Spacing.sm },
  sheet: { flex: 1, backgroundColor: Colors.bg },
  listContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: 110 },
  listHeading: { fontFamily: Font.semibold, fontSize: Type.meta + 1, color: Colors.textSecondary, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  cardBody: { flex: 1, minWidth: 0, gap: 2 },
  cardTitle: { fontFamily: Font.bold, fontSize: Type.section, color: Colors.text },
  cardMeta: { fontFamily: Font.regular, fontSize: Type.meta, color: Colors.textSecondary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontFamily: Font.semibold, fontSize: 12 },
  fabWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, paddingTop: Spacing.xl, backgroundColor: Colors.bg + 'F2' },
  fabInner: {},
  empty: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl },
  emptyCard: { gap: Spacing.md },
  emptyTitle: { fontFamily: Font.extrabold, fontSize: 22, color: Colors.text },
  emptyBody: { fontFamily: Font.regular, fontSize: Type.body, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.sm },
});
