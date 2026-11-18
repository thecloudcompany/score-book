import { useState, useCallback, type ReactNode } from 'react';
import { View, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { RefreshCw, Swords, Layers, Pencil, SlidersHorizontal, Check, type LucideIcon } from 'lucide-react-native';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SportIcon } from '@/components/ui/sport-icon';
import { enterRise } from '@/components/ui/motion';
import { AppInput } from '@/components/app-input';
import { Colors } from '@/constants/theme';
import { GroupFormatFields } from '@/components/group-format-fields';
import { SPORT_LABELS } from '@/lib/tournament-labels';
import { styles } from './tournament-details-section.styles';
import type { SportType } from '@/types';

export type PlayMode = 'round_robin' | 'knockout' | 'groups';

const PLAY_MODES: { value: PlayMode; title: string; Icon: LucideIcon; badmintonOnly?: boolean }[] = [
  { value: 'round_robin', title: 'Round robin', Icon: RefreshCw },
  { value: 'knockout', title: 'Knockout', Icon: Swords },
  { value: 'groups', title: 'Groups + knockout', Icon: Layers, badmintonOnly: true },
];

function NumberInput({
  value,
  defaultValue,
  label,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  defaultValue: number;
  label: string;
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
    <AppInput
      style={styles.advancedInput}
      value={raw}
      onChangeText={setRaw}
      onBlur={commit}
      keyboardType="number-pad"
      accessibilityLabel={label}
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
  groupCount: number;
  startingSlots: number;
  playerCount: number;
  children: ReactNode;
  onNameChange: (name: string) => void;
  onSportChange: (sport: SportType) => void;
  onPlayModeChange: (mode: PlayMode) => void;
  onFormatChange: (format: Record<string, number>) => void;
  onGroupCountChange: (count: number) => void;
  onSlotsChange: (slots: number) => void;
}

export function TournamentDetailsSection({
  name,
  sport,
  playMode,
  format,
  errors,
  groupCount,
  startingSlots,
  playerCount,
  children,
  onNameChange,
  onSportChange,
  onPlayModeChange,
  onFormatChange,
  onGroupCountChange,
  onSlotsChange,
}: TournamentDetailsSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showName, setShowName] = useState(false);
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
        <Text style={styles.label}>Sport</Text>
        <View style={styles.sportRow} accessibilityRole="radiogroup" accessibilityLabel="Sport">
          {(Object.keys(SPORT_LABELS) as SportType[]).map((value) => (
            <PressableScale
              key={value}
              style={[styles.sportBtn, sport === value && styles.sportBtnActive]}
              onPress={() => onSportChange(value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: sport === value }}
              aria-checked={sport === value}
            >
              <SportIcon sport={value} size={36} />
              <Text style={[styles.sportText, sport === value && styles.sportTextActive]} numberOfLines={1}>
                {SPORT_LABELS[value]}
              </Text>
              {sport === value && <Animated.View entering={enterRise(0)} style={styles.tick}><Check size={11} color="#fff" strokeWidth={3.5} /></Animated.View>}
            </PressableScale>
          ))}
        </View>
      </View>

      {children}

      <View style={styles.section}>
        <Text style={styles.label}>How to play</Text>
        <View style={styles.optionRow} accessibilityRole="radiogroup" accessibilityLabel="How to play">
          {visibleModes.map((mode) => {
            const active = playMode === mode.value;
            return (
              <PressableScale
                key={mode.value}
                style={[styles.optionCard, active && styles.typeBtnActive]}
                onPress={() => onPlayModeChange(mode.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                aria-checked={active}
              >
                <mode.Icon size={20} color={active ? Colors.primary : Colors.textMuted} strokeWidth={2.2} />
                <View style={styles.optionCopy}>
                  <Text style={[styles.typeText, active && styles.typeTextActive]}>{mode.title}</Text>
                </View>
              </PressableScale>
            );
          })}
        </View>
        {playMode === 'groups' && (
          <View style={styles.groupCount}>
            <GroupFormatFields
              playerCount={playerCount}
              groupCount={groupCount}
              startingSlots={startingSlots}
              onGroupCountChange={onGroupCountChange}
              onSlotsChange={onSlotsChange}
            />
            {errors.groups && <Text style={styles.error}>{errors.groups}</Text>}
          </View>
        )}
      </View>

      <View style={styles.optionalRow}>
        <PressableScale
          style={[styles.optionalAction, showName && styles.optionalOn]}
          onPress={() => { setShowName((shown) => !shown); setShowAdvanced(false); }}
          accessibilityRole="button"
          accessibilityState={{ expanded: showName }}
          aria-expanded={showName}
        >
          <View style={styles.optionalHead}><Pencil size={14} color={Colors.primary} /><Text style={styles.advancedText}>Name</Text></View>
          <Text style={styles.optionDescription} numberOfLines={1}>{name.trim() || 'Optional'}</Text>
        </PressableScale>
        <PressableScale
          style={[styles.optionalAction, showAdvanced && styles.optionalOn]}
          onPress={() => { setShowAdvanced((shown) => !shown); setShowName(false); }}
          accessibilityRole="button"
          accessibilityState={{ expanded: showAdvanced }}
          aria-expanded={showAdvanced}
        >
          <View style={styles.optionalHead}><SlidersHorizontal size={14} color={Colors.primary} /><Text style={styles.advancedText}>Scoring</Text></View>
          <Text style={styles.optionDescription} numberOfLines={1}>
            {sport === 'tennis'
              ? `Best of ${currentFormat} · ${format.gamesToWinPerSet ?? 6} games/set`
              : `${format.gamePoint ?? 21} points · ${currentFormat === 1 ? 'One game' : `Best of ${currentFormat}`}`}
          </Text>
        </PressableScale>
      </View>
      {showName && (
        <AppInput
          style={styles.input}
          value={name}
          onChangeText={onNameChange}
          placeholder="Tournament name"
          placeholderTextColor={Colors.textMuted}
          accessibilityLabel="Tournament name"
        />
      )}

      {showAdvanced && (
        <View style={styles.section}>
          <Text style={styles.label}>{sport === 'tennis' ? 'Sets in a match' : 'Games in a match'}</Text>
          <View style={styles.formatRow} accessibilityRole="radiogroup" accessibilityLabel="Match length">
            {formatOptions.map((num) => (
              <PressableScale
                key={num}
                style={[styles.formatBtn, currentFormat === num && styles.formatBtnActive]}
                onPress={() => onFormatChange({ ...format, [formatKey]: num })}
                accessibilityRole="radio"
                accessibilityState={{ checked: currentFormat === num }}
                aria-checked={currentFormat === num}
              >
                <Text
                  style={[
                    styles.formatBtnText,
                    currentFormat === num && styles.formatBtnTextActive,
                  ]}
                >
                  {formatLabel(num)}
                </Text>
              </PressableScale>
            ))}
          </View>
        </View>
      )}

      {showAdvanced && (
        <View style={styles.section}>
          {sport === 'tennis' ? (
            <View style={styles.advancedRow}>
              <Text style={styles.advancedLabel}>Games per set</Text>
              <NumberInput
                label="Games per set"
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
                label="Points to win"
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
