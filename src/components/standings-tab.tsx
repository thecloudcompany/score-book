import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { calculateKnockoutStandings } from '@/lib/knockout-standings';
import { getRoundName } from '@/lib/bracket-generator';
import type { PoolView } from '@/lib/pool-operations';
import { Font, Colors } from '@/constants/theme';
import { s } from './standings-tab.styles';
import type { Participant, Match, TournamentType, LeaderboardEntry, QualifierRecord } from '@/types';

interface StandingsTabProps {
  tournamentType: TournamentType;
  tournamentName: string;
  participants: Participant[];
  matches: Match[];
  standings: LeaderboardEntry[];
  poolViews: PoolView[];
  qualifiers: QualifierRecord[];
  captureRef: React.RefObject<React.ComponentRef<typeof View> | null>;
  getParticipantName: (id: number) => string;
}

export function StandingsTab({
  tournamentType,
  tournamentName,
  participants,
  matches,
  standings,
  poolViews,
  qualifiers,
  captureRef,
  getParticipantName,
}: StandingsTabProps) {
  const [viewedAt] = useState(() => new Date().toLocaleString());
  const shareHeader = (
    <View style={s.shareHeader}>
      <Text style={s.shareTitle}>{tournamentName}</Text>
      <Text style={s.shareSubtitle}>Standings, {viewedAt}</Text>
    </View>
  );

  const renderKnockout = (knockoutMatches: Match[], knockoutParticipants: Participant[]) => {
    const knockoutStandings = calculateKnockoutStandings(knockoutParticipants, knockoutMatches);
    const totalRounds = Math.max(...knockoutMatches.map((m) => m.round || 1), 1);

    return (
      <>
        {knockoutStandings.champion !== null && (
          <View style={s.knockoutSection}>
            <Text style={s.knockoutSectionTitle}>Champion</Text>
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
      </>
    );
  };

  if (tournamentType === 'knockout') {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View ref={captureRef} style={s.captureArea}>
          {shareHeader}
          {renderKnockout(matches, participants)}
        </View>
      </ScrollView>
    );
  }

  if (poolViews.length > 0) {
    const knockoutMatches = matches.filter((m) => m.poolId == null);
    const qualifiedIds = new Set(qualifiers.map((q) => q.participantId));
    const qualifiedParticipants = participants.filter((p) => qualifiedIds.has(p.id));
    const isLocked = qualifiers.length > 0;

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View ref={captureRef} style={s.captureArea}>
          {shareHeader}
          {poolViews.map(({ pool, rows }) => (
            <View key={pool.id} style={s.poolSection}>
              <Text style={s.poolTitle}>{pool.name}</Text>
              <View style={s.tableCard}>
                <View style={s.tableHeader}>
                  <Text style={[s.th, s.colRank]}>#</Text>
                  <Text style={[s.th, s.colPlayer]}>Player</Text>
                  <Text style={[s.th, s.colStat]}>P</Text>
                  <Text style={[s.th, s.colStat]}>W</Text>
                  <Text style={[s.th, s.colStat]}>L</Text>
                  <Text style={[s.th, s.colDiff]}>Diff</Text>
                  <Text style={[s.th, s.colTag]}></Text>
                </View>
                {rows.map((row) => {
                  const qualifier = qualifiers.find((q) => q.participantId === row.participantId);
                  const tag = !isLocked
                    ? ''
                    : qualifier?.source === 'direct'
                      ? 'Goes through'
                      : qualifier
                        ? 'Best runner-up'
                        : 'Out';
                  return (
                    <View key={row.participantId} style={s.tableRow}>
                      <Text style={[s.td, s.colRank, { fontFamily: Font.extrabold }]}>{row.rank}</Text>
                      <Text style={[s.td, s.colPlayer]} numberOfLines={1}>
                        {getParticipantName(row.participantId)}
                      </Text>
                      <Text style={[s.td, s.colStat]}>{row.played}</Text>
                      <Text style={[s.td, s.colStat]}>{row.wins}</Text>
                      <Text style={[s.td, s.colStat]}>{row.losses}</Text>
                      <Text
                        style={[
                          s.td,
                          s.colDiff,
                          row.pointDiff > 0 && { color: Colors.success },
                          row.pointDiff < 0 && { color: Colors.danger },
                        ]}
                      >
                        {row.pointDiff > 0 ? `+${row.pointDiff}` : row.pointDiff}
                      </Text>
                      <Text
                        style={[
                          s.tagText,
                          s.colTag,
                          (tag === 'Goes through' || tag === 'Best runner-up') && s.tagQualified,
                        ]}
                      >
                        {tag}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
          {knockoutMatches.length > 0 && renderKnockout(knockoutMatches, qualifiedParticipants)}
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
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View ref={captureRef} style={s.captureArea}>
        {shareHeader}
        <View style={s.tableCard}>
          <View style={s.tableHeader}>
            <Text style={[s.th, s.colRank]}>#</Text>
            <Text style={[s.th, s.colPlayer]}>Player</Text>
            <Text style={[s.th, s.colStat]}>W</Text>
            <Text style={[s.th, s.colStat]}>L</Text>
            <Text style={[s.th, s.colDiff]}>Diff</Text>
          </View>
          {standings.map((entry) => (
            <View key={entry.participantId} style={s.tableRow}>
              <Text style={[s.td, s.colRank, { fontFamily: Font.extrabold }]}>
                {entry.tiedWith.length > 0 ? `T${entry.rank}` : entry.rank}
              </Text>
              <Text style={[s.td, s.colPlayer]} numberOfLines={1}>
                {entry.name}
              </Text>
              <Text style={[s.td, s.colStat]}>{entry.wins}</Text>
              <Text style={[s.td, s.colStat]}>{entry.losses}</Text>
              <Text
                style={[
                  s.td,
                  s.colDiff,
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
