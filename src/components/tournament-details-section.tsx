import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { styles } from './tournament-details-section.styles';
import type { SportType } from '@/types';

export type PlayMode = 'round_robin' | 'knockout' | 'groups';

const PLAY_MODES: { value: PlayMode; title: string; badmintonOnly?: boolean }[] = [
  { value: 'round_robin', title: 'Everyone plays everyone' },
  { value: 'knockout', title: 'Knockout' },
  { value: 'groups', title: 'Groups, then knockout', badmintonOnly: true },
];

function NumberInput({
  value,
  defaultValue,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  defaultValue: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  const [raw, setRaw] = useState(String(value ?? defaultValue));

  const commit = useCallback(() => {
    // Strict integer within the same bounds the score inputs allow (0–99).
    if (!/^\d+$/.test(raw.trim())) {
      setRaw(String(defaultValue));
      onChange(defaultValue);
      return;
    }
    const parsed = parseInt(raw.trim(), 10);
    if (parsed < min || parsed > max) {
      setRaw(String(defaultValue));
      onChange(defaultValue);
    } else {
      setRaw(String(parsed));
      onChange(parsed);
    }
  }, [raw, defaultValue, onChange, min, max]);

  return (
    <TextInput
      style={styles.advancedInput}
      value={raw}
      onChangeText={setRaw}
      onBlur={commit}
      keyboardType="number-pad"
      selectionColor={Colors.primary}
    />
  );
}

interface TournamentDetailsSectionProps {
  name: string;
  sport: SportType;
  playMode: PlayMode;
  format: Record<string, number>;
  errors: Record<string, string>;
  onNameChange: (name: string) => void;
  onSportChange: (sport: SportType) => void;
  onPlayModeChange: (mode: PlayMode) => void;
  onFormatChange: (format: Record<string, number>) => void;
}

export function TournamentDetailsSection({
  name,
  sport,
  playMode,
  format,
  errors,
  onNameChange,
  onSportChange,
  onPlayModeChange,
  onFormatChange,
}: TournamentDetailsSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const formatOptions = [1, 3, 5];
  const formatKey = sport === 'tennis' ? 'setsToWin' : 'bestOfGames';
  const currentFormat = format[formatKey] ?? 3;
  const formatLabel = (num: number) => {
    if (num === 1) return 'Just one';
    return `Best of ${num}`;
  };
  const visibleModes = PLAY_MODES.filter((mode) => !mode.badmintonOnly || sport === 'badminton');

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.label}>Tournament name</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={onNameChange}
          placeholder="e.g. Sunday Badminton"
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.primary}
        />
        {errors.name && <Text style={styles.error}>{errors.name}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Sport</Text>
        <View style={styles.sportRow}>
          <TouchableOpacity
            style={[styles.sportBtn, sport === 'badminton' && styles.sportBtnActive]}
            onPress={() => onSportChange('badminton')}
            activeOpacity={0.8}
          >
            <Text style={[styles.sportText, sport === 'badminton' && styles.sportTextActive]} numberOfLines={1}>
              Badminton
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sportBtn, sport === 'tennis' && styles.sportBtnActive]}
            onPress={() => onSportChange('tennis')}
            activeOpacity={0.8}
          >
            <Text style={[styles.sportText, sport === 'tennis' && styles.sportTextActive]} numberOfLines={1}>
              Tennis
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sportBtn, sport === 'table_tennis' && styles.sportBtnActive]}
            onPress={() => onSportChange('table_tennis')}
            activeOpacity={0.8}
          >
            <Text style={[styles.sportText, sport === 'table_tennis' && styles.sportTextActive]} numberOfLines={1}>
              Table tennis
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sportBtn, sport === 'pickleball' && styles.sportBtnActive]}
            onPress={() => onSportChange('pickleball')}
            activeOpacity={0.8}
          >
            <Text style={[styles.sportText, sport === 'pickleball' && styles.sportTextActive]} numberOfLines={1}>
              Pickleball
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>How will it be played?</Text>
        <View style={styles.optionList}>
          {visibleModes.map((mode) => {
            const active = playMode === mode.value;
            return (
              <TouchableOpacity
                key={mode.value}
                style={[styles.optionCard, active && styles.typeBtnActive]}
                onPress={() => onPlayModeChange(mode.value)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.typeText, active && styles.typeTextActive]}>{mode.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{sport === 'tennis' ? 'Sets in a match' : 'Games in a match'}</Text>
        <View style={styles.formatRow}>
          {formatOptions.map((num) => (
            <TouchableOpacity
              key={num}
              style={[styles.formatBtn, currentFormat === num && styles.formatBtnActive]}
              onPress={() => onFormatChange({ ...format, [formatKey]: num })}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.formatBtnText,
                  currentFormat === num && styles.formatBtnTextActive,
                ]}
              >
                {formatLabel(num)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.advancedToggle}
        onPress={() => setShowAdvanced(!showAdvanced)}
        activeOpacity={0.7}
      >
        <Text style={styles.advancedText}>
          {showAdvanced ? 'Hide points setting' : 'Change points to win'}
        </Text>
        <Text style={styles.advancedArrow}>{showAdvanced ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {showAdvanced && (
        <View style={styles.section}>
          {sport === 'tennis' ? (
            <View style={styles.advancedRow}>
              <Text style={styles.advancedLabel}>Games per set</Text>
              <NumberInput
                key={sport}
                value={format.gamesToWinPerSet ?? 6}
                defaultValue={6}
                onChange={(gamesToWinPerSet) =>
                  onFormatChange({ ...format, gamesToWinPerSet })
                }
              />
            </View>
          ) : (
            <View style={styles.advancedRow}>
              <Text style={styles.advancedLabel}>Points to win</Text>
              <NumberInput
                key={sport}
                value={format.gamePoint ?? (sport === 'badminton' ? 21 : 11)}
                defaultValue={sport === 'badminton' ? 21 : 11}
                onChange={(gamePoint) => onFormatChange({ ...format, gamePoint })}
              />
            </View>
          )}
        </View>
      )}
    </>
  );
}
