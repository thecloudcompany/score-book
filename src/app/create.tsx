import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTournaments } from '@/hooks/use-tournaments';
import { ParticipantsSection } from '@/components/participants-section';
import { ByeSection } from '@/components/bye-section';
import { TournamentDetailsSection, type PlayMode } from '@/components/tournament-details-section';
import { ContentContainer } from '@/components/content-container';
import { startPools } from '@/lib/pool-operations';
import { advancementForGroups, maxGroupCount, recommendedPoolCount, settingsProblem } from '@/lib/pool-rules';
import { badmintonSport } from '@/lib/sports/badminton';
import { tennisSport } from '@/lib/sports/tennis';
import { tableTennisSport } from '@/lib/sports/table-tennis';
import { pickleballSport } from '@/lib/sports/pickleball';
import { Spacing } from '@/constants/theme';
import { SPORT_LABELS } from '@/lib/tournament-labels';
import { styles } from '@/components/create-tournament.styles';
import type { SportType, ByeConfig } from '@/types';

export default function CreateTournamentScreen() {
  const router = useRouter();
  const { createTournament } = useTournaments();

  const [name, setName] = useState('');
  const [sport, setSport] = useState<SportType>('badminton');
  const [playMode, setPlayMode] = useState<PlayMode>('round_robin');
  const [byeMethod, setByeMethod] = useState<'random' | 'manual'>('random');
  const [selectedByeNames, setSelectedByeNames] = useState<string[]>([]);
  const [showDrawOptions, setShowDrawOptions] = useState(false);
  const [format, setFormat] = useState<Record<string, number>>({
    gamePoint: badmintonSport.defaultFormat.gamePoint,
    bestOfGames: 1,
  });
  const [participants, setParticipants] = useState<string[]>(['', '']);
  const [groupCount, setGroupCount] = useState<number | null>(null);
  const [startingSlots, setStartingSlots] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSetSport = useCallback((newSport: SportType) => {
    setSport(newSport);
    if (newSport === 'badminton') {
      setFormat({
        gamePoint: badmintonSport.defaultFormat.gamePoint,
        bestOfGames: 1,
      });
    } else if (newSport === 'table_tennis') {
      setFormat({
        gamePoint: tableTennisSport.defaultFormat.gamePoint,
        bestOfGames: 1,
      });
    } else if (newSport === 'pickleball') {
      setFormat({
        gamePoint: pickleballSport.defaultFormat.gamePoint,
        bestOfGames: 1,
      });
    } else {
      setFormat({
        setsToWin: 1,
        gamesToWinPerSet: tennisSport.defaultFormat.gamesToWinPerSet,
      });
    }
  }, []);

  const addParticipant = useCallback(() => {
    setParticipants((prev) => [...prev, '']);
  }, []);

  // Groups only exist for badminton, so any other sport falls back to everyone-plays-everyone.
  const effectiveMode: PlayMode = sport === 'badminton' ? playMode : playMode === 'groups' ? 'round_robin' : playMode;
  const tournamentType = effectiveMode === 'knockout' ? 'knockout' : 'round_robin';

  const validParticipantCount = participants.filter((p) => p.trim().length > 0).length;
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(validParticipantCount || 1)));
  const byesNeeded = nextPowerOf2 - validParticipantCount;
  const groupsShown = Math.min(groupCount ?? recommendedPoolCount(validParticipantCount), maxGroupCount(validParticipantCount));
  const groupSettings = advancementForGroups(validParticipantCount, groupsShown, startingSlots);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const valid = participants.map((p) => p.trim()).filter((p) => p.length > 0);
    if (valid.length < 2) newErrors.participants = 'Add at least 2 players';
    if (new Set(valid).size !== valid.length) newErrors.participants = 'Each player needs a different name';
    if (effectiveMode === 'groups' && valid.length < 4) newErrors.participants = 'Groups need at least 4 players';
    if (effectiveMode === 'groups' && valid.length >= 4) {
      const problem = settingsProblem(valid.length, advancementForGroups(valid.length, groupsShown, startingSlots));
      if (problem) newErrors.groups = problem;
    }
    if (
      tournamentType === 'knockout' &&
      byeMethod === 'manual' &&
      byesNeeded > 0 &&
      selectedByeNames.length !== byesNeeded
    ) {
      newErrors.byes = `Choose ${byesNeeded} player${byesNeeded === 1 ? '' : 's'} to skip the first round`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [participants, effectiveMode, tournamentType, byeMethod, byesNeeded, selectedByeNames, groupsShown, startingSlots]);

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
      const tournament = createTournament(
        name.trim() || `${SPORT_LABELS[sport]} · ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
        sport,
        tournamentType,
        validParticipants,
        { ...defaultFormat, ...format },
        byeConfig
      );
      if (effectiveMode === 'groups') {
        startPools(tournament.id, advancementForGroups(validParticipants.length, groupsShown, startingSlots));
      }
      router.replace(`/tournament/${tournament.id}`);
    } catch (e) {
      setErrors({ form: e instanceof Error ? e.message : 'Could not create tournament' });
    }
  }, [name, sport, tournamentType, effectiveMode, byeMethod, selectedByeNames, format, participants, validate, createTournament, router, groupsShown, startingSlots]);

  const horizontalPad = Spacing.md;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.header, { paddingHorizontal: horizontalPad }]}>
          <TouchableOpacity style={styles.headerAction} accessibilityRole="button" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} activeOpacity={0.7}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New tournament</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingHorizontal: horizontalPad }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ContentContainer>
            <TournamentDetailsSection
              name={name}
              sport={sport}
              playMode={effectiveMode}
              format={format}
              errors={errors}
              groupCount={groupsShown}
              startingSlots={groupSettings.startingSlots}
              playerCount={validParticipantCount}
              onNameChange={setName}
              onSportChange={handleSetSport}
              onPlayModeChange={setPlayMode}
              onFormatChange={setFormat}
              onGroupCountChange={setGroupCount}
              onSlotsChange={setStartingSlots}
            >
              <ParticipantsSection
                participants={participants}
                errors={errors}
                onChange={updateParticipant}
                onAdd={addParticipant}
                onRemove={removeParticipant}
              />
            </TournamentDetailsSection>

            {tournamentType === 'knockout' && byesNeeded > 0 && (
              <TouchableOpacity
                style={styles.drawToggle}
                onPress={() => setShowDrawOptions((shown) => !shown)}
                accessibilityRole="button"
                aria-expanded={showDrawOptions}
                accessibilityState={{ expanded: showDrawOptions }}
              >
                <Text style={styles.backText}>Draw options</Text>
                <Text style={styles.hint}>{showDrawOptions ? 'Hide' : 'Random draw'}</Text>
              </TouchableOpacity>
            )}
            {tournamentType === 'knockout' && byesNeeded > 0 && showDrawOptions && (
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

            <View style={styles.footer}>
              <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.85} accessibilityRole="button">
                <Text style={styles.createBtnText}>Create tournament</Text>
              </TouchableOpacity>
            </View>
          </ContentContainer>
        </ScrollView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
