import { useMemo, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { AppInput } from '@/components/app-input';
import { MatchRow } from './match-row';
import { getRoundName } from '@/lib/bracket-generator';
import { canEditMatch, isByeMatch } from '@/lib/knockout-standings';
import { Search, X, ChevronDown } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { s } from './matches-tab.styles';
import type { Match, BadmintonMatch, TennisSet, BadmintonGame, TennisMatch, TableTennisMatch, TableTennisGame, PickleballMatch, PickleballGame, Pool, SportType, TournamentType } from '@/types';

interface MatchesTabProps {
  tournamentType: TournamentType;
  matches: (BadmintonMatch | TennisMatch | TableTennisMatch | PickleballMatch)[];
  units: Record<number, BadmintonGame[] | TennisSet[] | TableTennisGame[] | PickleballGame[]>;
  sport: SportType;
  pools: Pool[];
  poolsLocked: boolean;
  getParticipantName: (id: number) => string;
  onMatchPress: (matchId: number) => void;
}

export function MatchesTab({
  tournamentType,
  matches,
  units,
  sport,
  pools,
  poolsLocked,
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
      .join(', ');
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
      if (slot === 'B' && isByeMatch(match)) return 'BYE';
      const feeders = feederByConsumer.get(match.id) ?? [];
      if (feeders.length === 1) return `Winner of Match ${feeders[0].bracketPosition}`;
      return 'TBD';
    },
    [getParticipantName, feederByConsumer]
  );

  const [query, setQuery] = useState('');
  const [showGroups, setShowGroups] = useState(false);
  const [showFinished, setShowFinished] = useState(false);

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
  const searching = query.trim() !== '';
  const visibleMatches = filteredMatches.filter((match) => match.status !== 'completed' || showFinished || searching);
  const finishedCount = matches.filter((match) =>
    match.status === 'completed' && !isByeMatch(match) && (!poolsLocked || match.poolId == null)
  ).length;
  const finishedToggle = finishedCount > 0 && !searching ? (
    <TouchableOpacity
      style={s.groupToggle}
      onPress={() => setShowFinished((shown) => !shown)}
      accessibilityRole="button"
      accessibilityState={{ expanded: showFinished }}
      aria-expanded={showFinished}
    >
      <Text style={s.groupToggleText}>{showFinished ? 'Hide finished' : `Show finished (${finishedCount})`}</Text>
      <ChevronDown size={16} color={Colors.primary} style={showFinished ? { transform: [{ rotate: '180deg' }] } : undefined} />
    </TouchableOpacity>
  ) : null;

  const searchBar = (
    <View style={s.searchWrap}>
      <View style={s.searchRow}>
        <Search size={18} color={Colors.textMuted} style={s.searchIcon} />
        <AppInput
          style={s.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by player name"
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.primary}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="search"
          accessibilityLabel="Search matches"
        />
        {query !== '' && (
          <TouchableOpacity
            style={s.searchClear}
            onPress={() => setQuery('')}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <X size={16} color={Colors.textSecondary} strokeWidth={2.6} />
          </TouchableOpacity>
        )}
      </View>
      {searching && (
        <Text style={s.searchSummary} accessibilityLiveRegion="polite">
          {filteredMatches.length} {filteredMatches.length === 1 ? 'match' : 'matches'} found
        </Text>
      )}
    </View>
  );

  // Round names come from the full bracket so filtering can't relabel rounds.
  const totalRounds = Math.max(...matches.filter((m) => m.poolId == null).map((m) => m.round || 1), 1);

  const renderKnockoutRounds = (list: typeof matches) => {
    const rounds = new Map<number, typeof matches>();
    for (const match of list) {
      const round = match.round || 1;
      if (!rounds.has(round)) rounds.set(round, []);
      rounds.get(round)!.push(match);
    }
    return Array.from(rounds.entries())
      .sort((a, b) => {
        const aDone = a[1].every((match) => match.status === 'completed');
        const bDone = b[1].every((match) => match.status === 'completed');
        return Number(aDone) - Number(bDone) || a[0] - b[0];
      })
      .map(([round, roundMatches]) => (
        <View key={round} style={s.section}>
          <Text style={s.sectionTitle}>{getRoundName(round, totalRounds)}</Text>
          {[...roundMatches].sort((a, b) => Number(a.status === 'completed') - Number(b.status === 'completed')).map((match) => (
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
      ));
  };

  if (tournamentType === 'knockout') {
    return (
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]} contentContainerStyle={s.listContent}>
        {searchBar}
        {showEmpty && <Text style={s.emptyText}>No matches for “{query.trim()}”</Text>}
        {renderKnockoutRounds(visibleMatches)}
        {finishedToggle}
      </ScrollView>
    );
  }

  if (pools.length > 0) {
    return (
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]} contentContainerStyle={s.listContent}>
        {searchBar}
        {showEmpty && <Text style={s.emptyText}>No matches for “{query.trim()}”</Text>}
        {poolsLocked && renderKnockoutRounds(visibleMatches.filter((m) => m.poolId == null))}
        {poolsLocked && (
          <TouchableOpacity
            style={s.groupToggle}
            onPress={() => setShowGroups((shown) => !shown)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showGroups }}
            aria-expanded={showGroups}
          >
            <Text style={s.groupToggleText}>{showGroups ? 'Hide group results' : 'Group results'}</Text>
            <ChevronDown size={16} color={Colors.primary} style={showGroups ? { transform: [{ rotate: '180deg' }] } : undefined} />
          </TouchableOpacity>
        )}
        {(!poolsLocked || showGroups || query.trim() !== '') && pools.map((pool) => {
          const poolMatches = (poolsLocked ? filteredMatches : visibleMatches)
            .filter((m) => m.poolId === pool.id)
            .sort((a, b) => Number(a.status === 'completed') - Number(b.status === 'completed') || a.id - b.id);
          if (poolMatches.length === 0) return null;
          return (
            <View key={pool.id} style={s.section}>
              <Text style={s.sectionTitle}>{pool.name}</Text>
              {poolMatches.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  playerADisplay={getSlotLabel(match, 'A')}
                  playerBDisplay={getSlotLabel(match, 'B')}
                  isBye={false}
                  isLocked={poolsLocked}
                  lockedNote="Group results are final"
                  preview={getPreview(match.id)}
                  onPress={onMatchPress}
                />
              ))}
            </View>
          );
        })}
        {!poolsLocked && renderKnockoutRounds(visibleMatches.filter((m) => m.poolId == null))}
        {finishedToggle}
      </ScrollView>
    );
  }

  const upcoming = visibleMatches.filter((m) => m.status === 'upcoming');
  const inProgress = visibleMatches.filter((m) => m.status === 'in_progress');
  const completed = visibleMatches.filter((m) => m.status === 'completed');

  const renderSection = (title: string, matchList: typeof matches) => {
    if (matchList.length === 0) return null;
    return (
      <View style={s.section}>
        <Text style={s.sectionTitle}>
          {title} ({matchList.length})
        </Text>
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
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]} contentContainerStyle={s.listContent}>
      {searchBar}
      {showEmpty && <Text style={s.emptyText}>No matches for “{query.trim()}”</Text>}
      {renderSection('In progress', inProgress)}
      {renderSection('Up next', upcoming)}
      {renderSection('Results', completed)}
      {finishedToggle}
    </ScrollView>
  );
}
