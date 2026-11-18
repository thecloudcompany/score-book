import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CourtLines } from './ui/court-lines';
import { ChevronLeft, Share2, Settings2, Check } from 'lucide-react-native';
import { ContentContainer } from './content-container';
import { PressableScale } from './ui/pressable-scale';
import { SportIcon } from './ui/sport-icon';
import { SPORT_LABELS, playFormatLabel } from '@/lib/tournament-labels';
import { Colors, Font, Radius, Spacing, Type } from '@/constants/theme';
import type { Tournament } from '@/types';

interface TournamentHeaderProps {
  tournament: Tournament;
  managing: boolean;
  onBack: () => void;
  onManage: () => void;
  onShare?: () => void;
  sharing?: boolean;
}

export function TournamentHeader({ tournament, managing, onBack, onManage, onShare, sharing = false }: TournamentHeaderProps) {
  const grouped = tournament.poolCount != null && !managing;
  return (
    <View style={s.wrap}>
      <CourtLines />
      <SafeAreaView edges={['top', 'left', 'right']}>
        <ContentContainer>
          <View style={s.navigation}>
            <PressableScale style={s.iconBtn} onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to tournaments" hitSlop={8}>
              <ChevronLeft size={22} color="#fff" strokeWidth={2.4} />
            </PressableScale>
            <View style={s.spacer} />
            {onShare && (
              <PressableScale style={[s.iconBtn, sharing && s.dim]} onPress={onShare} disabled={sharing} accessibilityRole="button" accessibilityLabel="Share standings" accessibilityState={{ disabled: sharing, busy: sharing }}>
                <Share2 size={18} color="#fff" strokeWidth={2.2} />
              </PressableScale>
            )}
            <PressableScale style={[s.iconBtn, managing && s.iconBtnOn]} onPress={onManage} accessibilityRole="button" accessibilityLabel={managing ? 'Done' : 'Manage'} aria-expanded={managing}>
              {managing ? <Check size={20} color={Colors.primaryDark} strokeWidth={2.8} /> : <Settings2 size={19} color="#fff" strokeWidth={2.2} />}
            </PressableScale>
          </View>
          <View style={s.titleRow}>
            <SportIcon sport={tournament.sport} size={46} solid />
            <View style={s.titleText}>
              <Text style={s.title} numberOfLines={1}>{managing ? 'Manage' : tournament.name}</Text>
              <Text style={s.meta} numberOfLines={1}>
                {SPORT_LABELS[tournament.sport]} · {grouped ? (
                  <>
                    <Text style={tournament.stage === 'pools' && s.currentStage}>Groups</Text>
                    {' → '}
                    <Text style={tournament.stage === 'knockout' && s.currentStage}>Knockout</Text>
                  </>
                ) : playFormatLabel(tournament)}
              </Text>
            </View>
          </View>
        </ContentContainer>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { backgroundColor: Colors.primaryDark, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, overflow: 'hidden', borderBottomWidth: 3, borderBottomColor: Colors.gold },
  navigation: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', paddingTop: Spacing.xs },
  spacer: { flex: 1 },
  iconBtn: {
    width: 42, height: 42, borderRadius: Radius.sm + 2, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  iconBtnOn: { backgroundColor: '#fff' },
  dim: { opacity: 0.55 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.md },
  titleText: { flex: 1, minWidth: 0 },
  title: { fontFamily: Font.extrabold, fontSize: 22, lineHeight: 28, color: '#fff', letterSpacing: -0.3 },
  meta: { fontFamily: Font.medium, fontSize: Type.meta, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
  currentStage: { fontFamily: Font.bold, color: Colors.gold },
});
