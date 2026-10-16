import { useMemo, useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { MatchRow } from './match-row';
import { getRoundName } from '@/lib/bracket-generator';
import { canEditMatch, isByeMatch } from '@/lib/knockout-standings';
import { Colors } from '@/constants/theme';
import { s } from './matches-tab.styles';
import type { Match, BadmintonMatch, TennisSet, BadmintonGame, TennisMatch, TableTennisMatch, TableTennisGame, PickleballMatch, PickleballGame, SportType, TournamentType } from '@/types';

interface MatchesTabProps {
  tournamentType: TournamentType;
  matches: (BadmintonMatch | TennisMatch | TableTennisMatch | PickleballMatch)[];
  units: Record<number, BadmintonGame[] | TennisSet[] | TableTennisGame[] | PickleballGame[]>;
  sport: SportType;
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
  const isScoreSport = sport !== 'tennis';

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

  const [query, setQuery] = useState('');

  // Every whitespace-separated token must appear in either side's name,
  // so "india aus" finds India vs Australia.
  const filteredMatches = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return matches;
    return matches.filter((match) => {
      const haystack = `${getSlotLabel(match, 'A')} ${getSlotLabel(match, 'B')}`.toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }, [matches, query, getSlotLabel]);

  const showEmpty = query.trim() !== '' && filteredMatches.length === 0;

  const searchBar = (
    <View style={s.searchWrap}>
      <TextInput
        style={s.searchInput}
        value={query}
        onChangeText={setQuery}
        placeholder="Search team or opponent"
        placeholderTextColor={Colors.textMuted}
        selectionColor={Colors.primary}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Search matches"
      />
      {query !== '' && (
        <TouchableOpacity
          style={s.searchClear}
          onPress={() => setQuery('')}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
        >
          <Text style={s.searchClearText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (tournamentType === 'knockout') {
    const rounds = new Map<number, typeof matches>();
    for (const match of filteredMatches) {
      const round = match.round || 1;
      if (!rounds.has(round)) rounds.set(round, []);
      rounds.get(round)!.push(match);
    }
    // Round names come from the full bracket so filtering can't relabel rounds.
    const totalRounds = Math.max(...matches.map((m) => m.round || 1), 1);

    return (
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]} contentContainerStyle={{ paddingBottom: 40 }}>
        {searchBar}
        {showEmpty && <Text style={s.emptyText}>No matches for “{query.trim()}”</Text>}
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

  const upcoming = filteredMatches.filter((m) => m.status === 'upcoming');
  const inProgress = filteredMatches.filter((m) => m.status === 'in_progress');
  const completed = filteredMatches.filter((m) => m.status === 'completed');

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
    <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]} contentContainerStyle={{ paddingBottom: 40 }}>
      {searchBar}
      {showEmpty && <Text style={s.emptyText}>No matches for “{query.trim()}”</Text>}
      {renderSection('Live', inProgress)}
      {renderSection('Upcoming', upcoming)}
      {renderSection('Completed', completed)}
    </ScrollView>
  );
}
