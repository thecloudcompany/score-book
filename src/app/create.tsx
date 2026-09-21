import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTournaments } from '@/hooks/use-tournaments';
import { ParticipantsSection } from '@/components/participants-section';
import { ByeSection } from '@/components/bye-section';
import { TournamentDetailsSection } from '@/components/tournament-details-section';
import { ContentContainer } from '@/components/content-container';
import { badmintonSport } from '@/lib/sports/badminton';
import { tennisSport } from '@/lib/sports/tennis';
import { tableTennisSport } from '@/lib/sports/table-tennis';
import { pickleballSport } from '@/lib/sports/pickleball';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';
import type { SportType, TournamentType, ByeConfig } from '@/types';

export default function CreateTournamentScreen() {
  const router = useRouter();
  const { createTournament } = useTournaments();

  const [name, setName] = useState('');
  const [sport, setSport] = useState<SportType>('badminton');
  const [tournamentType, setTournamentType] = useState<TournamentType>('round_robin');
  const [byeMethod, setByeMethod] = useState<'random' | 'manual'>('random');
  const [selectedByeNames, setSelectedByeNames] = useState<string[]>([]);
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
    } else if (newSport === 'table_tennis') {
      setFormat({
        gamePoint: tableTennisSport.defaultFormat.gamePoint,
        bestOfGames: tableTennisSport.defaultFormat.bestOfGames,
      });
    } else if (newSport === 'pickleball') {
      setFormat({
        gamePoint: pickleballSport.defaultFormat.gamePoint,
        bestOfGames: pickleballSport.defaultFormat.bestOfGames,
      });
    } else {
      setFormat({
        setsToWin: 3,
        gamesToWinPerSet: tennisSport.defaultFormat.gamesToWinPerSet,
      });
    }
  }, []);

  const addParticipant = useCallback(() => {
    setParticipants((prev) => [...prev, '']);
  }, []);

  const validParticipantCount = participants.filter((p) => p.trim().length > 0).length;
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(validParticipantCount || 1)));
  const byesNeeded = nextPowerOf2 - validParticipantCount;

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Required';
    const valid = participants.map((p) => p.trim()).filter((p) => p.length > 0);
    if (valid.length < 2) newErrors.participants = 'Need at least 2 players';
    if (new Set(valid).size !== valid.length) newErrors.participants = 'Names must be unique';
    if (
      tournamentType === 'knockout' &&
      byeMethod === 'manual' &&
      byesNeeded > 0 &&
      selectedByeNames.length !== byesNeeded
    ) {
      newErrors.byes = `Select ${byesNeeded} bye${byesNeeded === 1 ? '' : 's'}`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, participants, tournamentType, byeMethod, byesNeeded, selectedByeNames]);

  const removeParticipant = useCallback((index: number) => {
    setParticipants((prev) => {
      const removed = prev[index]?.trim();
      const next = prev.filter((_, i) => i !== index);
      if (removed) {
        setSelectedByeNames((prevNames) =>
          prevNames.filter((n) => n !== removed && next.map((p) => p.trim()).includes(n))
        );
      }
      return next;
    });
  }, []);

  const updateParticipant = useCallback((index: number, value: string) => {
    setParticipants((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleCreate = useCallback(() => {
    if (!validate()) return;
    const validParticipants = participants.map((p) => p.trim()).filter((p) => p.length > 0);
    const defaultFormat =
      sport === 'badminton'
        ? badmintonSport.defaultFormat
        : sport === 'table_tennis'
          ? tableTennisSport.defaultFormat
          : sport === 'pickleball'
            ? pickleballSport.defaultFormat
            : tennisSport.defaultFormat;

    let byeConfig: ByeConfig | undefined;
    if (tournamentType === 'knockout') {
      if (byeMethod === 'manual') {
        const validIndices = selectedByeNames
          .map((n) => validParticipants.indexOf(n))
          .filter((i) => i >= 0);
        byeConfig = { method: 'manual', manualIds: validIndices };
      } else {
        byeConfig = { method: 'random' };
      }
    }

    try {
      createTournament(name.trim(), sport, tournamentType, validParticipants, { ...defaultFormat, ...format }, byeConfig);
      router.back();
    } catch (e) {
      setErrors({ form: e instanceof Error ? e.message : 'Could not create tournament' });
    }
  }, [name, sport, tournamentType, byeMethod, selectedByeNames, format, participants, validate, createTournament, router]);

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
          <ContentContainer>
            <TournamentDetailsSection
              name={name}
              sport={sport}
              tournamentType={tournamentType}
              format={format}
              errors={errors}
              onNameChange={setName}
              onSportChange={handleSetSport}
              onTournamentTypeChange={setTournamentType}
              onFormatChange={setFormat}
            />

            <ParticipantsSection
              participants={participants}
              errors={errors}
              onChange={updateParticipant}
              onAdd={addParticipant}
              onRemove={removeParticipant}
            />

            {tournamentType === 'knockout' && (
              <ByeSection
                validParticipantCount={validParticipantCount}
                nextPowerOf2={nextPowerOf2}
                byesNeeded={byesNeeded}
                participants={participants}
                byeMethod={byeMethod}
                selectedByeNames={selectedByeNames}
                onMethodChange={setByeMethod}
                onSelectedNamesChange={setSelectedByeNames}
              />
            )}
            {errors.byes && <Text style={styles.formError}>{errors.byes}</Text>}
            {errors.form && <Text style={styles.formError}>{errors.form}</Text>}

            <View style={{ height: 20 }} />
          </ContentContainer>
        </ScrollView>

        <View style={styles.footer}>
          <ContentContainer>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.85}>
              <Text style={styles.createBtnText}>Create Tournament</Text>
            </TouchableOpacity>
          </ContentContainer>
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
  formError: {
    fontFamily: Font.semibold,
    fontSize: 13,
    color: '#DC2626',
    marginTop: 8,
  },
});
