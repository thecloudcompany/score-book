import { View, Text, TouchableOpacity } from 'react-native';
import { statusColor } from '@/constants/theme';
import { isByeMatch, getParticipantPlaceholder } from '@/lib/knockout-standings';
import { s } from './match-row.styles';
import type { Match, MatchStatus, TournamentType } from '@/types';

interface MatchRowProps {
  match: Match;
  tournamentType: TournamentType;
  getParticipantName: (id: number) => string;
  preview: string | null;
  onPress: (matchId: number) => void;
}

function StatusDot({ status }: { status: MatchStatus }) {
  return <View style={[s.statusDot, { backgroundColor: statusColor(status) }]} />;
}

export function MatchRow({
  match,
  tournamentType,
  getParticipantName,
  preview,
  onPress,
}: MatchRowProps) {
  const isBye = tournamentType === 'knockout' && isByeMatch(match);
  const playerBDisplay =
    match.participantBId !== null
      ? getParticipantName(match.participantBId)
      : tournamentType === 'knockout'
        ? getParticipantPlaceholder(match, 'B')
        : 'TBD';

  return (
    <TouchableOpacity
      style={[s.row, isBye && s.rowBye]}
      onPress={() => !isBye && onPress(match.id)}
      activeOpacity={isBye ? 1 : 0.8}
      disabled={isBye}
    >
      <View style={s.left}>
        <Text style={s.players}>
          {getParticipantName(match.participantAId)}
          <Text style={s.vs}> vs </Text>
          <Text style={isBye ? s.byeText : s.tbdText}>{playerBDisplay}</Text>
        </Text>
        {preview && <Text style={s.preview}>{preview}</Text>}
      </View>
      <StatusDot status={match.status} />
    </TouchableOpacity>
  );
}
