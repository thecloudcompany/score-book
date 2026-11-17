import { View, Text } from 'react-native';
import { calculateKnockoutStandings } from '@/lib/knockout-standings';
import { getRoundName } from '@/lib/bracket-generator';
import type { PoolView } from '@/lib/pool-operations';
import { StandingsTable } from './standings-table';
import { StandingsCapture, type StandingsCaptureRef } from './standings-capture';
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
  captureRef: React.RefObject<StandingsCaptureRef | null>;
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
  const shareHeader = (
    <View style={s.shareHeader}>
      <Text style={s.shareTitle}>{tournamentName}</Text>
      <Text style={s.shareSubtitle}>Standings</Text>
    </View>
  );

  const renderKnockout = (knockoutMatches: Match[], knockoutParticipants: Participant[], compact = false) => {
    const knockoutStandings = calculateKnockoutStandings(knockoutParticipants, knockoutMatches);
    const totalRounds = Math.max(...knockoutMatches.map((m) => m.round || 1), 1);
    const runnerUp = knockoutStandings.champion !== null
      ? knockoutStandings.eliminatedByRound.get(totalRounds)?.[0]
      : undefined;

    return (
      <>
        {knockoutStandings.champion !== null && (
          <View style={s.championCard}>
            <Text style={s.championLabel}>Champion</Text>
            <Text style={s.championName}>{getParticipantName(knockoutStandings.champion)}</Text>
            {runnerUp && (
              <View style={s.runnerUp}>
                <Text style={s.runnerUpLabel}>Runner-up</Text>
                <Text style={s.runnerUpName}>{runnerUp.name}</Text>
              </View>
            )}
          </View>
        )}

        {!compact && knockoutStandings.stillCompeting.length > 0 && (
          <View style={s.knockoutSection}>
            <Text style={s.knockoutSectionTitle}>
              In play ({knockoutStandings.stillCompeting.length})
            </Text>
            <Text style={s.knockoutParticipantName}>{knockoutStandings.stillCompeting.map((p) => p.name).join(', ')}</Text>
          </View>
        )}

        {(!compact || knockoutStandings.champion !== null) && Array.from(knockoutStandings.eliminatedByRound.entries())
          .filter(([round]) => !runnerUp || round !== totalRounds)
          .sort((a, b) => b[0] - a[0])
          .map(([round, eliminatedParticipants]) => (
            <View key={round} style={s.knockoutSection}>
              <Text style={s.knockoutSectionTitle}>
                Out in {getRoundName(round, totalRounds).toLowerCase()}
              </Text>
              {eliminatedParticipants.map((participant) => (
                <Text key={participant.id} style={s.resultName}>{participant.name}</Text>
              ))}
            </View>
          ))}
      </>
    );
  };

  if (tournamentType === 'knockout') {
    return (
      <StandingsCapture ref={captureRef}>
        {shareHeader}
        {renderKnockout(matches, participants)}
      </StandingsCapture>
    );
  }

  if (poolViews.length > 0) {
    const knockoutMatches = matches.filter((m) => m.poolId == null);
    const qualifiedIds = new Set(qualifiers.map((q) => q.participantId));
    const qualifiedParticipants = participants.filter((p) => qualifiedIds.has(p.id));
    const isLocked = qualifiers.length > 0;

    return (
      <StandingsCapture ref={captureRef}>
        {shareHeader}
        {knockoutMatches.length > 0 && renderKnockout(knockoutMatches, qualifiedParticipants, true)}
        {poolViews.map(({ pool, rows }) => (
          <View key={pool.id} style={s.poolSection}>
            <Text style={s.poolTitle}>{pool.name}</Text>
            <StandingsTable
              label={`${pool.name} standings`}
              rows={rows.map((row) => ({
                ...row,
                name: getParticipantName(row.participantId),
                qualified: isLocked ? qualifiedIds.has(row.participantId) : undefined,
              }))}
            />
          </View>
        ))}
      </StandingsCapture>
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
    <StandingsCapture ref={captureRef}>
      {shareHeader}
      <StandingsTable
        label="Standings"
        rows={standings.map((entry) => ({
          ...entry,
          rank: entry.tiedWith.length > 0 ? `T${entry.rank}` : entry.rank,
        }))}
      />
    </StandingsCapture>
  );
}
