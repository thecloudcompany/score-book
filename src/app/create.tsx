import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTournaments } from '@/hooks/use-tournaments';
import { badmintonSport } from '@/lib/sports/badminton';
import { tennisSport } from '@/lib/sports/tennis';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';
import type { SportType } from '@/types';

export default function CreateTournamentScreen() {
  const router = useRouter();
  const { createTournament } = useTournaments();

  const [name, setName] = useState('');
  const [sport, setSport] = useState<SportType>('badminton');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [format, setFormat] = useState<Record<string, number>>({
    gamePoint: badmintonSport.defaultFormat.gamePoint,
    bestOfGames: badmintonSport.defaultFormat.bestOfGames,
  });
  const [participants, setParticipants] = useState<string[]>(['', '']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSetSport = useCallback((newSport: SportType) => {
    setSport(newSport);
    if (newSport === 'badminton') {
      setFormat({
        gamePoint: badmintonSport.defaultFormat.gamePoint,
        bestOfGames: badmintonSport.defaultFormat.bestOfGames,
      });
    } else {
      setFormat({
        setsToWin: tennisSport.defaultFormat.setsToWin,
        gamesToWinPerSet: tennisSport.defaultFormat.gamesToWinPerSet,
      });
    }
  }, []);

  const addParticipant = useCallback(() => {
    setParticipants((prev) => [...prev, '']);
  }, []);

  const removeParticipant = useCallback((index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateParticipant = useCallback((index: number, value: string) => {
    setParticipants((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Required';
    const valid = participants.map((p) => p.trim()).filter((p) => p.length > 0);
    if (valid.length < 2) newErrors.participants = 'Need at least 2 players';
    if (new Set(valid).size !== valid.length) newErrors.participants = 'Names must be unique';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, participants]);

  const handleCreate = useCallback(() => {
    if (!validate()) return;
    const validParticipants = participants.map((p) => p.trim()).filter((p) => p.length > 0);
    const defaultFormat = sport === 'badminton' ? badmintonSport.defaultFormat : tennisSport.defaultFormat;
    createTournament(name.trim(), sport, validParticipants, { ...defaultFormat, ...format });
    router.back();
  }, [name, sport, format, participants, validate, createTournament, router]);

  const formatOptions = sport === 'badminton' ? [1, 3, 5] : [1, 3, 5];
  const formatKey = sport === 'badminton' ? 'bestOfGames' : 'setsToWin';
  const currentFormat = format[formatKey] ?? (sport === 'badminton' ? 3 : 2);

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Tournament</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder="Weekend Smash"
            placeholderTextColor={Colors.textMuted}
            autoFocus
          />
          {errors.name && <Text style={styles.error}>{errors.name}</Text>}
        </View>

        {/* Sport */}
        <View style={styles.section}>
          <Text style={styles.label}>Sport</Text>
          <View style={styles.sportRow}>
            <TouchableOpacity
              style={[styles.sportBtn, sport === 'badminton' && styles.sportBtnActive]}
              onPress={() => handleSetSport('badminton')}
              activeOpacity={0.8}
            >
              <Text style={styles.sportEmoji}>🏸</Text>
              <Text style={[styles.sportText, sport === 'badminton' && styles.sportTextActive]}>
                Badminton
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sportBtn, sport === 'tennis' && styles.sportBtnActive]}
              onPress={() => handleSetSport('tennis')}
              activeOpacity={0.8}
            >
              <Text style={styles.sportEmoji}>🎾</Text>
              <Text style={[styles.sportText, sport === 'tennis' && styles.sportTextActive]}>
                Tennis
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Match Format */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {sport === 'badminton' ? 'Games to win' : 'Sets to win'}
          </Text>
          <View style={styles.formatRow}>
            {formatOptions.map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.formatBtn, currentFormat === num && styles.formatBtnActive]}
                onPress={() => setFormat((prev) => ({ ...prev, [formatKey]: num }))}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.formatBtnText,
                    currentFormat === num && styles.formatBtnTextActive,
                  ]}
                >
                  {num === 1 ? 'Single' : `Best of ${num}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Advanced Toggle */}
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
            {sport === 'badminton' ? (
              <View style={styles.advancedRow}>
                <Text style={styles.advancedLabel}>Points to win</Text>
                <TextInput
                  style={styles.advancedInput}
                  value={String(format.gamePoint ?? 21)}
                  onChangeText={(v) =>
                    setFormat((prev) => ({ ...prev, gamePoint: parseInt(v) || 21 }))
                  }
                  keyboardType="number-pad"
                />
              </View>
            ) : (
              <View style={styles.advancedRow}>
                <Text style={styles.advancedLabel}>Games per set</Text>
                <TextInput
                  style={styles.advancedInput}
                  value={String(format.gamesToWinPerSet ?? 6)}
                  onChangeText={(v) =>
                    setFormat((prev) => ({ ...prev, gamesToWinPerSet: parseInt(v) || 6 }))
                  }
                  keyboardType="number-pad"
                />
              </View>
            )}
          </View>
        )}

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.label}>Players</Text>
          {errors.participants && <Text style={styles.error}>{errors.participants}</Text>}
          {participants.map((p, index) => (
            <View key={index} style={styles.playerRow}>
              <TextInput
                style={styles.playerInput}
                value={p}
                onChangeText={(v) => updateParticipant(index, v)}
                placeholder={`Player ${index + 1}`}
                placeholderTextColor={Colors.textMuted}
              />
              {participants.length > 2 && (
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeParticipant(index)}>
                  <Text style={styles.removeText}>−</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addBtn} onPress={addParticipant} activeOpacity={0.7}>
            <Text style={styles.addBtnText}>+ Add Player</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.85}>
          <Text style={styles.createBtnText}>Create Tournament</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backText: {
    fontFamily: Font.semibold,
    fontSize: 15,
    color: Colors.primary,
  },
  headerTitle: {
    fontFamily: Font.bold,
    fontSize: 17,
    color: Colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  section: {
    marginTop: Spacing.lg,
  },
  label: {
    fontFamily: Font.semibold,
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  input: {
    fontFamily: Font.regular,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  error: {
    fontFamily: Font.medium,
    fontSize: 13,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  sportRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sportBtn: {
    flex: 1,
    borderRadius: Radius.sm,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sportBtnActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  sportEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  sportText: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sportTextActive: {
    color: Colors.primary,
  },
  formatRow: {
    flexDirection: 'row',
    gap: 8,
  },
  formatBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formatBtnActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  formatBtnText: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  formatBtnTextActive: {
    color: Colors.primary,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    paddingVertical: 8,
  },
  advancedText: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  advancedArrow: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  advancedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  advancedLabel: {
    fontFamily: Font.medium,
    fontSize: 15,
    color: Colors.text,
  },
  advancedInput: {
    fontFamily: Font.regular,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: 80,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  playerInput: {
    flex: 1,
    fontFamily: Font.regular,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    fontSize: 18,
    color: Colors.danger,
    fontWeight: '600',
    lineHeight: 20,
  },
  addBtn: {
    marginTop: 4,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addBtnText: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.primary,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 16,
    backgroundColor: Colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  createBtnText: {
    fontFamily: Font.bold,
    fontSize: 16,
    color: Colors.textInverse,
  },
});
