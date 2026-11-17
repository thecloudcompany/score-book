import { useState } from 'react';
import { View, Text } from 'react-native';
import { GroupFormatFields } from '@/components/group-format-fields';
import {
  advancementForGroups,
  advancementLabel,
  knockoutPath,
  type PoolAdvancement,
} from '@/lib/pool-rules';
import { s } from './pool-settings-section.styles';
import type { Tournament } from '@/types';

interface PoolSettingsSectionProps {
  tournament: Tournament;
  playerCount: number;
  onUpdateAdvancement: (patch: Omit<PoolAdvancement, 'poolCount'>) => string | null;
}

export function PoolSettingsSection({
  tournament,
  playerCount,
  onUpdateAdvancement,
}: PoolSettingsSectionProps) {
  const [error, setError] = useState('');
  const groups = tournament.poolCount ?? 2;
  const settings = advancementForGroups(playerCount, groups, tournament.startingSlots);

  const changeSlots = (slots: number) => {
    const next = advancementForGroups(playerCount, groups, slots);
    setError(onUpdateAdvancement({
      startingSlots: next.startingSlots,
      qualifiersPerPool: next.qualifiersPerPool,
      wildcardMetric: tournament.wildcardMetric ?? next.wildcardMetric,
    }) ?? '');
  };

  if (tournament.stage === 'knockout') {
    const saved = {
      poolCount: groups,
      startingSlots: tournament.startingSlots ?? 2,
      qualifiersPerPool: tournament.qualifiersPerPool ?? 1,
    };
    return (
      <View style={s.body}>
        <Text style={s.path}>{knockoutPath(saved.startingSlots)}</Text>
        <Text style={s.suggested}>{advancementLabel(saved)}</Text>
      </View>
    );
  }

  return (
    <View style={s.body}>
      <GroupFormatFields
        playerCount={playerCount}
        groupCount={groups}
        startingSlots={settings.startingSlots}
        onSlotsChange={changeSlots}
      />
      {error !== '' && <Text style={s.error}>{error}</Text>}
    </View>
  );
}
