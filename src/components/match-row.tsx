import { View, Text, TouchableOpacity } from 'react-native';
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

  return (
    <TouchableOpacity
      style={[s.row, match.status === 'in_progress' && s.rowInProgress, isBye && s.rowBye]}
      onPress={() => !isNonInteractive && onPress(match.id)}
      activeOpacity={isNonInteractive ? 1 : 0.8}
      disabled={isNonInteractive}
      accessibilityRole="button"
      accessibilityLabel={`${playerADisplay} against ${playerBDisplay}, ${STATUS_LABEL[match.status]}${note ? `, ${note}` : ''}`}
      accessibilityState={{ disabled: isNonInteractive }}
      aria-disabled={isNonInteractive}
    >
      <View style={s.players}>
        <Text style={s.name} numberOfLines={2}>{playerADisplay}</Text>
        <Text style={[s.name, (isBye || isTBD) && s.nameMuted]} numberOfLines={2}>
          {playerBDisplay}
        </Text>
        {note && <Text style={s.note}>{note}</Text>}
      </View>
      <View style={s.side}>
        {preview && <Text style={s.score}>{preview}</Text>}
        {!isNonInteractive && match.status !== 'completed' && (
          <Text style={[s.status, { color: Colors.primary }]}>
            {match.status === 'in_progress' ? 'Continue' : 'Enter score'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
