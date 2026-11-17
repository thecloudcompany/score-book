import { View, Text } from 'react-native';
import { s } from './standings-tab.styles';

interface StandingRow {
  participantId: number;
  rank: number | string;
  name: string;
  wins: number;
  losses: number;
  pointDiff: number;
  qualified?: boolean;
}

export function StandingsTable({ label, rows }: { label: string; rows: StandingRow[] }) {
  return (
    <View style={s.tableCard} role="table" aria-label={label}>
      <View style={s.tableHeader} role="row">
        <Text style={[s.th, s.colRank]} role="columnheader" aria-label="Rank">#</Text>
        <Text style={[s.th, s.colPlayer]} role="columnheader">Player</Text>
        <Text style={[s.th, s.colStat]} role="columnheader" aria-label="Wins">W</Text>
        <Text style={[s.th, s.colStat]} role="columnheader" aria-label="Losses">L</Text>
        <Text style={[s.th, s.colDiff]} role="columnheader" aria-label="Point difference">+/−</Text>
      </View>
      {rows.map((row) => (
        <View key={row.participantId} style={[s.tableRow, row.qualified && s.qualifiedRow]} role="row">
          <Text style={[s.td, s.colRank]} role="cell">{row.rank}</Text>
          <View style={s.colPlayer} role="cell">
            <Text style={s.td} accessibilityLabel={row.name}>{row.name}</Text>
            {row.qualified !== undefined && (
              <Text style={[s.tagText, row.qualified && s.tagQualified]}>
                {row.qualified ? 'Qualified' : 'Out'}
              </Text>
            )}
          </View>
          <Text style={[s.td, s.colStat]} role="cell">{row.wins}</Text>
          <Text style={[s.td, s.colStat]} role="cell">{row.losses}</Text>
          <Text style={[s.td, s.colDiff]} role="cell">
            {row.pointDiff > 0 ? `+${row.pointDiff}` : row.pointDiff}
          </Text>
        </View>
      ))}
    </View>
  );
}
