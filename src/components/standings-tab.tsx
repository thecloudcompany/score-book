import { View, Text, ScrollView } from 'react-native';
import { calculateKnockoutStandings } from '@/lib/knockout-standings';
import { getRoundName } from '@/lib/bracket-generator';
import { Font, Colors } from '@/constants/theme';
import { s } from './standings-tab.styles';
import type { Participant, Match, TournamentType, LeaderboardEntry } from '@/types';

interface StandingsTabProps {
  tournamentType: TournamentType;
  participants: Participant[];
  matches: Match[];
  standings: LeaderboardEntry[];
  captureRef: React.RefObject<View | null>;
  getParticipantName: (id: number) => string;
}

export function StandingsTab({
  tournamentType,
  participants,
  matches,
  standings,
  captureRef,
  getParticipantName,
}: StandingsTabProps) {
  if (tournamentType === 'knockout') {
    const knockoutStandings = calculateKnockoutStandings(participants, matches);
    const totalRounds = Math.max(...matches.map((m) => m.round || 1), 1);

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View ref={captureRef} style={s.captureArea}>
          {knockoutStandings.champion !== null && (
            <View style={s.knockoutSection}>
              <Text style={s.knockoutSectionTitle}>🏆 Champion</Text>
              <View style={s.knockoutParticipantCard}>
                <Text style={s.knockoutParticipantName}>
                  {getParticipantName(knockoutStandings.champion)}
                </Text>
              </View>
            </View>
          )}

          {knockoutStandings.stillCompeting.length > 0 && (
            <View style={s.knockoutSection}>
              <Text style={s.knockoutSectionTitle}>
                Still Competing ({knockoutStandings.stillCompeting.length})
              </Text>
              {knockoutStandings.stillCompeting.map((p) => (
                <View key={p.id} style={s.knockoutParticipantCard}>
                  <Text style={s.knockoutParticipantName}>{p.name}</Text>
                </View>
              ))}
            </View>
          )}

          {Array.from(knockoutStandings.eliminatedByRound.entries())
            .sort((a, b) => b[0] - a[0])
            .map(([round, eliminatedParticipants]) => (
              <View key={round} style={s.knockoutSection}>
                <Text style={s.knockoutSectionTitle}>
                  Eliminated in {getRoundName(round, totalRounds)} ({eliminatedParticipants.length})
                </Text>
                {eliminatedParticipants.map((p) => (
                  <View
                    key={p.id}
                    style={[s.knockoutParticipantCard, s.knockoutParticipantCardEliminated]}
                  >
                    <Text style={s.knockoutParticipantName}>{p.name}</Text>
                  </View>
                ))}
              </View>
            ))}
        </View>
      </ScrollView>
    );
  }

  if (standings.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>No completed matches yet</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View ref={captureRef} style={s.captureArea}>
        <View style={s.tableCard}>
          <View style={s.tableHeader}>
            <Text style={[s.th, { flex: 0.5 }]}>#</Text>
            <Text style={[s.th, { flex: 2.2 }]}>Player</Text>
            <Text style={[s.th, { flex: 0.7, textAlign: 'center' }]}>W</Text>
            <Text style={[s.th, { flex: 0.7, textAlign: 'center' }]}>L</Text>
            <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Diff</Text>
          </View>
          {standings.map((entry) => (
            <View key={entry.participantId} style={s.tableRow}>
              <Text style={[s.td, { flex: 0.5, fontFamily: Font.extrabold }]}>
                {entry.tiedWith.length > 0 ? `T${entry.rank}` : entry.rank}
              </Text>
              <Text style={[s.td, { flex: 2.2 }]} numberOfLines={1}>
                {entry.name}
              </Text>
              <Text style={[s.td, { flex: 0.7, textAlign: 'center' }]}>{entry.wins}</Text>
              <Text style={[s.td, { flex: 0.7, textAlign: 'center' }]}>{entry.losses}</Text>
              <Text
                style={[
                  s.td,
                  { flex: 1, textAlign: 'right' },
                  entry.pointDiff > 0 && { color: Colors.success },
                  entry.pointDiff < 0 && { color: Colors.danger },
                ]}
              >
                {entry.pointDiff > 0 ? `+${entry.pointDiff}` : entry.pointDiff}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
