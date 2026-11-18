import { View, Text } from 'react-native';
import { ChevronRight, Lock, Check } from 'lucide-react-native';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Colors } from '@/constants/theme';
import { s } from './match-row.styles';
import type { Match, MatchStatus } from '@/types';

interface MatchRowProps {
  match: Match;
  playerADisplay: string;
  playerBDisplay: string;
  isBye: boolean;
  isLocked: boolean;
  lockedNote?: string;
  preview: string | null;
  onPress: (matchId: number) => void;
}

const STATUS_LABEL: Record<MatchStatus, string> = {
  upcoming: 'Not started',
  in_progress: 'In progress',
  completed: 'Done',
};

export function MatchRow({
  match,
  playerADisplay,
  playerBDisplay,
  isBye,
  isLocked,
  lockedNote = 'Winner already advanced',
  preview,
  onPress,
}: MatchRowProps) {
  const isTBD =
    !isBye && (match.participantAId == null || match.participantBId == null);
  const isNonInteractive = isBye || isLocked || isTBD;
  const note = isLocked && !preview ? lockedNote : isTBD ? 'Awaiting winners' : null;
  const live = match.status === 'in_progress';
  const done = match.status === 'completed';

  return (
    <PressableScale
      style={[s.row, live && s.rowInProgress, isBye && s.rowBye]}
      onPress={() => !isNonInteractive && onPress(match.id)}
      haptic={!isNonInteractive}
      scaleTo={isNonInteractive ? 1 : 0.98}
      disabled={isNonInteractive}
      accessibilityRole="button"
      accessibilityLabel={`${playerADisplay} against ${playerBDisplay}, ${STATUS_LABEL[match.status]}${note ? `, ${note}` : ''}`}
      accessibilityState={{ disabled: isNonInteractive }}
      aria-disabled={isNonInteractive}
    >
      <View style={[s.bar, live && s.barLive, done && s.barDone]} />
      <View style={s.players}>
        <Text style={s.name} numberOfLines={2}>{playerADisplay}</Text>
        <View style={s.divider} />
        <Text style={[s.name, (isBye || isTBD) && s.nameMuted]} numberOfLines={2}>
          {playerBDisplay}
        </Text>
        {note && (
          <View style={s.noteRow}>
            {isLocked && <Lock size={12} color={Colors.textMuted} />}
            <Text style={s.note}>{note}</Text>
          </View>
        )}
      </View>
      <View style={s.side}>
        {preview && <Text style={s.score}>{preview}</Text>}
        {done && !isNonInteractive && <Check size={16} color={Colors.success} strokeWidth={3} />}
        {!isNonInteractive && !done && (
          <View style={s.cta}>
            {live && <View style={s.liveDot} />}
            <Text style={s.ctaText}>{live ? 'Continue' : 'Enter score'}</Text>
            <ChevronRight size={14} color={Colors.primary} strokeWidth={2.6} />
          </View>
        )}
      </View>
    </PressableScale>
  );
}
