import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ContentContainer } from './content-container';
import { SPORT_LABELS, playFormatLabel } from '@/lib/tournament-labels';
import { Colors, Font, Spacing, Type } from '@/constants/theme';
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
  return (
    <View style={s.wrap}>
      <ContentContainer>
        <View style={s.navigation}>
          <TouchableOpacity style={s.back} hitSlop={8} onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to tournaments">
            <Text style={s.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={s.title} numberOfLines={1}>{managing ? 'Manage' : tournament.name}</Text>
          {onShare && (
            <TouchableOpacity style={s.action} onPress={onShare} disabled={sharing} accessibilityRole="button" accessibilityLabel="Share standings" accessibilityState={{ disabled: sharing, busy: sharing }}>
              <Text style={s.actionText}>{sharing ? 'Preparing…' : 'Share'}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.action} onPress={onManage} accessibilityRole="button" aria-expanded={managing}>
            <Text style={s.actionText}>{managing ? 'Done' : 'Manage'}</Text>
          </TouchableOpacity>
        </View>
        <View style={s.metaRow}>
          <Text style={s.meta} numberOfLines={1}>
            {SPORT_LABELS[tournament.sport]} · {tournament.poolCount != null && !managing ? (
              <>
                <Text style={tournament.stage === 'pools' && s.currentStage}>Groups</Text>
                {' → '}
                <Text style={tournament.stage === 'knockout' && s.currentStage}>Knockout</Text>
              </>
            ) : playFormatLabel(tournament)}
          </Text>
        </View>
      </ContentContainer>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xs },
  navigation: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  action: { minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' },
  back: { width: 32, minHeight: 48, justifyContent: 'center' },
  backText: { fontFamily: Font.medium, fontSize: 32, color: Colors.primary },
  actionText: { fontFamily: Font.semibold, fontSize: Type.meta, color: Colors.primary },
  title: { fontFamily: Font.bold, fontSize: Type.section, color: Colors.text, flex: 1 },
  metaRow: { paddingBottom: Spacing.xs },
  meta: { fontFamily: Font.regular, fontSize: Type.meta, color: Colors.textSecondary, flex: 1 },
  currentStage: { fontFamily: Font.bold, color: Colors.primary },
});
