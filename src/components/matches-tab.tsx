import { useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { MatchRow } from './match-row';
import { getRoundName } from '@/lib/bracket-generator';
import { canEditMatch, isByeMatch } from '@/lib/knockout-standings';
import { s } from './matches-tab.styles';
import type { Match, BadmintonMatch, TennisSet, BadmintonGame, TennisMatch, TableTennisMatch, TableTennisGame, TournamentType } from '@/types';

interface MatchesTabProps {
  tournamentType: TournamentType;
  matches: (BadmintonMatch | TennisMatch | TableTennisMatch)[];
  units: Record<number, BadmintonGame[] | TennisSet[] | TableTennisGame[]>;
  sport: 'badminton' | 'tennis' | 'table_tennis';
  getParticipantName: (id: number) => string;
  onMatchPress: (matchId: number) => void;
}

export function MatchesTab({
  tournamentType,
  matches,
  units,
  sport,
  getParticipantName,
  onMatchPress,
}: MatchesTabProps) {
  const isScoreSport = sport === 'badminton' || sport === 'table_tennis';

  const getPreview = (matchId: number): string | null => {
    const matchUnits = units[matchId] || [];
    const filled = matchUnits.filter((u: any) => {
      const a = isScoreSport ? u.scoreA : u.gamesA;
      const b = isScoreSport ? u.scoreB : u.gamesB;
      return a !== null && b !== null;
    });
    if (filled.length === 0) return null;
    return filled
      .map((u: any) => {
        const a = isScoreSport ? u.scoreA : u.gamesA;
        const b = isScoreSport ? u.scoreB : u.gamesB;
        return `${a}-${b}`;
      })
      .join('  ·  ');
  };

  // Build feeder map once: who feeds into each consumer match.
  // Multiple feeders (the final has 2) → slot stays "TBD".
  const feederByConsumer = useMemo(() => {
    const map = new Map<number, Match[]>();
    for (const match of matches) {
      if (match.feedsIntoMatchId != null) {
        const list = map.get(match.feedsIntoMatchId) ?? [];
        list.push(match);
        map.set(match.feedsIntoMatchId, list);
      }
    }
    return map;
  }, [matches]);

  const getSlotLabel = useCallback(
    (match: Match, slot: 'A' | 'B'): string => {
      const id = slot === 'A' ? match.participantAId : match.participantBId;
      if (id !== null && id !== undefined) return getParticipantName(id);
      if (tournamentType !== 'knockout') return 'TBD';
      if (slot === 'B' && isByeMatch(match)) return 'BYE';
      const feeders = feederByConsumer.get(match.id) ?? [];
      if (feeders.length === 1) return `Winner of Match ${feeders[0].bracketPosition}`;
      return 'TBD';
    },
    [tournamentType, getParticipantName, feederByConsumer]
  );

  if (tournamentType === 'knockout') {
    const rounds = new Map<number, typeof matches>();
    for (const match of matches) {
      const round = match.round || 1;
      if (!rounds.has(round)) rounds.set(round, []);
      rounds.get(round)!.push(match);
    }
    const totalRounds = Math.max(...Array.from(rounds.keys()), 1);

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {Array.from(rounds.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([round, roundMatches]) => (
            <View key={round} style={s.section}>
              <Text style={s.sectionTitle}>{getRoundName(round, totalRounds)}</Text>
              {roundMatches.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  playerADisplay={getSlotLabel(match, 'A')}
                  playerBDisplay={getSlotLabel(match, 'B')}
                  isBye={isByeMatch(match)}
                  isLocked={!canEditMatch(match, matches)}
                  preview={getPreview(match.id)}
                  onPress={onMatchPress}
                />
              ))}
            </View>
          ))}
      </ScrollView>
    );
  }

  const upcoming = matches.filter((m) => m.status === 'upcoming');
  const inProgress = matches.filter((m) => m.status === 'in_progress');
  const completed = matches.filter((m) => m.status === 'completed');

  const renderSection = (title: string, matchList: typeof matches) => {
    if (matchList.length === 0) return null;
    return (
      <View style={s.section}>
        <Text style={s.sectionTitle}>{title}</Text>
        {matchList.map((match) => (
          <MatchRow
            key={match.id}
            match={match}
            playerADisplay={getSlotLabel(match, 'A')}
            playerBDisplay={getSlotLabel(match, 'B')}
            isBye={false}
            isLocked={false}
            preview={getPreview(match.id)}
            onPress={onMatchPress}
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {renderSection('Live', inProgress)}
      {renderSection('Upcoming', upcoming)}
      {renderSection('Completed', completed)}
    </ScrollView>
  );
}
