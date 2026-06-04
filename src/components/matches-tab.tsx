import { View, Text, ScrollView } from 'react-native';
import { MatchRow } from './match-row';
import { getRoundName } from '@/lib/bracket-generator';
import { s } from './matches-tab.styles';
import type { BadmintonMatch, TennisSet, BadmintonGame, TennisMatch, TournamentType } from '@/types';

interface MatchesTabProps {
  tournamentType: TournamentType;
  matches: (BadmintonMatch | TennisMatch)[];
  units: Record<number, BadmintonGame[] | TennisSet[]>;
  sport: 'badminton' | 'tennis';
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
  const getPreview = (matchId: number): string | null => {
    const matchUnits = units[matchId] || [];
    const filled = matchUnits.filter((u: any) => {
      const a = sport === 'badminton' ? u.scoreA : u.gamesA;
      const b = sport === 'badminton' ? u.scoreB : u.gamesB;
      return a !== null && b !== null;
    });
    if (filled.length === 0) return null;
    return filled
      .map((u: any) => {
        const a = sport === 'badminton' ? u.scoreA : u.gamesA;
        const b = sport === 'badminton' ? u.scoreB : u.gamesB;
        return `${a}-${b}`;
      })
      .join('  ·  ');
  };

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
                  tournamentType="knockout"
                  getParticipantName={getParticipantName}
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
            tournamentType="round_robin"
            getParticipantName={getParticipantName}
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
