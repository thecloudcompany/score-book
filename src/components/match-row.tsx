import { View, Text, TouchableOpacity } from 'react-native';
import { statusColor } from '@/constants/theme';
import { s } from './match-row.styles';
import type { Match, MatchStatus } from '@/types';

interface MatchRowProps {
  match: Match;
  playerADisplay: string;
  playerBDisplay: string;
  isBye: boolean;
  isLocked: boolean;
  preview: string | null;
  onPress: (matchId: number) => void;
}

function StatusDot({ status }: { status: MatchStatus }) {
  return <View style={[s.statusDot, { backgroundColor: statusColor(status) }]} />;
}

export function MatchRow({
  match,
  playerADisplay,
  playerBDisplay,
  isBye,
  isLocked,
  preview,
  onPress,
}: MatchRowProps) {
  const isNonInteractive = isBye || isLocked;

  return (
    <TouchableOpacity
      style={[s.row, isBye && s.rowBye, isLocked && s.rowLocked]}
      onPress={() => !isNonInteractive && onPress(match.id)}
      activeOpacity={isNonInteractive ? 1 : 0.8}
      disabled={isNonInteractive}
    >
      <View style={s.left}>
        <Text style={s.players}>
          {playerADisplay}
          <Text style={s.vs}> vs </Text>
          <Text style={isBye ? s.byeText : s.tbdText}>{playerBDisplay}</Text>
        </Text>
        {isLocked && <Text style={s.lockedNote}>Winner already advanced — locked</Text>}
        {preview && <Text style={s.preview}>{preview}</Text>}
      </View>
      <StatusDot status={match.status} />
    </TouchableOpacity>
  );
}
