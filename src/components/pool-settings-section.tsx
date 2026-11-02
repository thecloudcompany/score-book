import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { s } from './pool-settings-section.styles';
import {
  defaultAdvancement,
  settingsProblem,
  slotOptions,
  startingRoundLabel,
  type PoolAdvancement,
} from '@/lib/pool-rules';
import type { Tournament, WildcardMetric } from '@/types';

const RUNNER_UP_OPTIONS: { value: WildcardMetric; label: string }[] = [
  { value: 'win_rate', label: 'Most wins' },
  { value: 'point_diff_per_match', label: 'Best points difference' },
];

interface PoolSettingsSectionProps {
  tournament: Tournament;
  playerCount: number;
  hasScores: boolean;
  onStartPools: (settings: PoolAdvancement) => string | null;
  onUpdateAdvancement: (patch: Omit<PoolAdvancement, 'poolCount'>) => string | null;
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const decDisabled = value <= min;
  const incDisabled = value >= max;
  return (
    <View style={s.stepper}>
      <TouchableOpacity
        style={[s.stepBtn, decDisabled && s.disabled]}
        onPress={() => onChange(value - 1)}
        disabled={decDisabled}
        activeOpacity={0.7}
        accessibilityLabel="Fewer"
      >
        <Text style={s.stepText}>−</Text>
      </TouchableOpacity>
      <Text style={s.stepValue}>{value}</Text>
      <TouchableOpacity
        style={[s.stepBtn, incDisabled && s.disabled]}
        onPress={() => onChange(value + 1)}
        disabled={incDisabled}
        activeOpacity={0.7}
        accessibilityLabel="More"
      >
        <Text style={s.stepText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export function PoolSettingsSection({
  tournament,
  playerCount,
  hasScores,
  onStartPools,
  onUpdateAdvancement,
}: PoolSettingsSectionProps) {
  const [error, setError] = useState('');
  const [confirmStart, setConfirmStart] = useState(false);

  const started = tournament.stage === 'pools' || tournament.stage === 'knockout';
  const knockoutSet = tournament.stage === 'knockout';

  const values: PoolAdvancement = {
    poolCount: tournament.poolCount ?? 2,
    startingSlots: tournament.startingSlots ?? 2,
    qualifiersPerPool: tournament.qualifiersPerPool ?? 1,
    wildcardMetric: tournament.wildcardMetric ?? 'win_rate',
  };

  const change = (patch: Partial<PoolAdvancement>) => {
    const next = { ...values, ...patch };
    setError(
      onUpdateAdvancement({
        startingSlots: next.startingSlots,
        qualifiersPerPool: next.qualifiersPerPool,
        wildcardMetric: next.wildcardMetric,
      }) ?? ''
    );
  };

  const confirmStartGroups = () => {
    setConfirmStart(false);
    setError(onStartPools(defaultAdvancement(playerCount)) ?? '');
  };

  const canStart = playerCount >= 4 && !hasScores;
  const smallestGroup = Math.floor(playerCount / values.poolCount);

  if (!started) {
    return (
      <>
        <View style={s.body}>
          <Text style={s.intro}>
            Split the players into small groups at random. Everyone plays their group, and the best go on to a knockout.
          </Text>
          {hasScores && <Text style={s.hint}>Groups can only be made before any scores are entered.</Text>}
          {!hasScores && playerCount < 4 && (
            <Text style={s.hint}>Add at least 4 players to use groups.</Text>
          )}
          {error !== '' && <Text style={s.error}>{error}</Text>}
          {canStart && (
            <TouchableOpacity style={s.primaryBtn} onPress={() => setConfirmStart(true)} activeOpacity={0.85}>
              <Text style={s.primaryText}>Split into groups</Text>
            </TouchableOpacity>
          )}
        </View>

        <ConfirmDialog
          visible={confirmStart}
          title="Split into groups?"
          message="The current matches will be replaced with group matches. This cannot be undone."
          confirmText="Split"
          cancelText="Cancel"
          destructive
          onConfirm={confirmStartGroups}
          onCancel={() => setConfirmStart(false)}
        />
      </>
    );
  }

  return (
    <>
      <View style={s.body}>
        {knockoutSet ? (
          <>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>From each group</Text>
              <Text style={s.summaryValue}>{values.qualifiersPerPool} go through</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Knockout size</Text>
              <Text style={s.summaryValue}>{values.startingSlots} players</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Best runners-up by</Text>
              <Text style={s.summaryValue}>
                {RUNNER_UP_OPTIONS.find((o) => o.value === values.wildcardMetric)?.label}
              </Text>
            </View>
            <Text style={s.hint}>The knockout has been made, so these settings are locked.</Text>
          </>
        ) : (
          <>
            <Text style={s.intro}>Choose who goes through to the knockout. You can change this until the knockout is made.</Text>

            <View style={s.field}>
              <Text style={s.label}>Players who go through from each group</Text>
              <Stepper
                value={values.qualifiersPerPool}
                min={1}
                max={smallestGroup}
                onChange={(qualifiersPerPool) => change({ qualifiersPerPool })}
              />
            </View>

            <View style={s.field}>
              <Text style={s.label}>Players in the knockout</Text>
              <View style={s.chipRow}>
                {slotOptions(playerCount).map((slots) => {
                  const valid = settingsProblem(playerCount, { ...values, startingSlots: slots }) === null;
                  const active = values.startingSlots === slots;
                  return (
                    <TouchableOpacity
                      key={slots}
                      style={[s.chip, active && s.chipActive, !valid && !active && s.disabled]}
                      onPress={() => change({ startingSlots: slots })}
                      disabled={!valid}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.chipText, active && s.chipTextActive]}>{slots} players</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={s.suggested}>That is the {startingRoundLabel(values.startingSlots).toLowerCase()}.</Text>
            </View>

            <View style={s.field}>
              <Text style={s.label}>Best runners-up are picked by</Text>
              <View style={s.chipRow}>
                {RUNNER_UP_OPTIONS.map((option) => {
                  const active = values.wildcardMetric === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[s.chip, active && s.chipActive]}
                      onPress={() => change({ wildcardMetric: option.value })}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.chipText, active && s.chipTextActive]}>{option.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {error !== '' && <Text style={s.error}>{error}</Text>}
          </>
        )}
      </View>
    </>
  );
}
