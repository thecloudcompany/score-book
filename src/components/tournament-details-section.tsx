import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { styles } from './tournament-details-section.styles';
import type { SportType, TournamentType } from '@/types';

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
  tournamentType: TournamentType;
  format: Record<string, number>;
  errors: Record<string, string>;
  onNameChange: (name: string) => void;
  onSportChange: (sport: SportType) => void;
  onTournamentTypeChange: (type: TournamentType) => void;
  onFormatChange: (format: Record<string, number>) => void;
}

export function TournamentDetailsSection({
  name,
  sport,
  tournamentType,
  format,
  errors,
  onNameChange,
  onSportChange,
  onTournamentTypeChange,
  onFormatChange,
}: TournamentDetailsSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const formatOptions = [1, 3, 5];
  const formatKey = sport === 'tennis' ? 'setsToWin' : 'bestOfGames';
  const currentFormat = format[formatKey] ?? 3;
  const formatLabel = (num: number) => {
    if (num === 1) return 'Single';
    return `Best of ${num}`;
  };

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={onNameChange}
          placeholder="Weekend Smash"
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
            <Text style={styles.sportEmoji}>🏸</Text>
            <Text style={[styles.sportText, sport === 'badminton' && styles.sportTextActive]}>
              Badminton
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sportBtn, sport === 'tennis' && styles.sportBtnActive]}
            onPress={() => onSportChange('tennis')}
            activeOpacity={0.8}
          >
            <Text style={styles.sportEmoji}>🎾</Text>
            <Text style={[styles.sportText, sport === 'tennis' && styles.sportTextActive]}>
              Tennis
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sportBtn, sport === 'table_tennis' && styles.sportBtnActive]}
            onPress={() => onSportChange('table_tennis')}
            activeOpacity={0.8}
          >
            <Text style={styles.sportEmoji}>🏓</Text>
            <Text style={[styles.sportText, sport === 'table_tennis' && styles.sportTextActive]}>
              Table Tennis
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Tournament Type</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, tournamentType === 'round_robin' && styles.typeBtnActive]}
            onPress={() => onTournamentTypeChange('round_robin')}
            activeOpacity={0.8}
          >
            <Text style={[styles.typeText, tournamentType === 'round_robin' && styles.typeTextActive]}>
              Round-Robin
            </Text>
            <Text style={styles.typeDescription}>Everyone plays everyone</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, tournamentType === 'knockout' && styles.typeBtnActive]}
            onPress={() => onTournamentTypeChange('knockout')}
            activeOpacity={0.8}
          >
            <Text style={[styles.typeText, tournamentType === 'knockout' && styles.typeTextActive]}>
              Knockout
            </Text>
            <Text style={styles.typeDescription}>Single elimination</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{sport === 'tennis' ? 'Sets to win' : 'Games to win'}</Text>
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
          {showAdvanced ? 'Hide Advanced' : 'Advanced Options'}
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
                value={format.gamePoint ?? (sport === 'table_tennis' ? 11 : 21)}
                defaultValue={sport === 'table_tennis' ? 11 : 21}
                onChange={(gamePoint) => onFormatChange({ ...format, gamePoint })}
              />
            </View>
          )}
        </View>
      )}
    </>
  );
}
