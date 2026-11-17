import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import { useReducedMotionPreference } from '@/hooks/use-reduced-motion';
import { AppInput } from '@/components/app-input';
import { ModalSafeArea } from './modal-safe-area';
import { Colors, Motion } from '@/constants/theme';
import { useIsWideLayout, MODAL_MAX_WIDTH } from '@/hooks/use-layout';
import { s } from './score-entry-modal.styles';
import type { Sport, MatchFormat } from '@/types';

interface ScoreUnit {
  unitNumber: number;
  scoreA: number | null;
  scoreB: number | null;
}

interface ScoreEntryModalProps {
  playerA: string;
  playerB: string;
  unitLabel: string;
  units: ScoreUnit[];
  sport: Sport;
  format: MatchFormat;
  onSave: (unitNumber: number, scoreA: number, scoreB: number) => void;
  onClose: () => void;
}

export default function ScoreEntryModal({
  playerA,
  playerB,
  unitLabel,
  units,
  sport,
  format,
  onSave,
  onClose,
}: ScoreEntryModalProps) {
  const isWide = useIsWideLayout();
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotionPreference();
  const [backdropOpacity] = useState(() => new Animated.Value(0));
  const [panelOpacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(0));
  const entered = useRef(false);
  const previousSize = useRef({ width, height });

  useEffect(() => {
    const backdrop = Animated.timing(backdropOpacity, {
      toValue: 1,
      duration: Motion.duration.modal,
      easing: Easing.bezier(...Motion.easeOut),
      useNativeDriver: Platform.OS !== 'web',
    });
    backdrop.start();
    return () => {
      backdrop.stop();
      panelOpacity.stopAnimation();
      translateY.stopAnimation();
      panelOpacity.setValue(1);
      translateY.setValue(0);
    };
  }, [backdropOpacity, panelOpacity, translateY]);

  useEffect(() => {
    if (reduceMotion || previousSize.current.width !== width || previousSize.current.height !== height) {
      translateY.stopAnimation();
      translateY.setValue(0);
    }
    previousSize.current = { width, height };
  }, [reduceMotion, width, height, translateY]);

  const revealPanel = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (entered.current || height <= 0) return;
    entered.current = true;
    translateY.setValue(!reduceMotion && !isWide ? height : 0);
    Animated.parallel([
      Animated.timing(panelOpacity, {
        toValue: 1,
        duration: Motion.duration.modal,
        easing: Easing.bezier(...Motion.easeOut),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: Motion.duration.modal,
        easing: Easing.bezier(...Motion.drawer),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ], { stopTogether: false }).start();
  };

  const inputA = useRef<React.ComponentRef<typeof AppInput>>(null);
  const inputB = useRef<React.ComponentRef<typeof AppInput>>(null);
  // Only units up to and including the clincher are playable — later units
  // would be ignored by the standings, so don't offer them.
  const decidedIndex = (() => {
    let aWins = 0;
    let bWins = 0;
    const winsNeeded =
      'bestOfGames' in format
        ? Math.ceil(((format.bestOfGames ?? 3) as number) / 2)
        : ((format.setsToWin ?? 2) as number);
    const ordered = [...units].sort((x, y) => x.unitNumber - y.unitNumber);
    for (let i = 0; i < ordered.length; i++) {
      const u = ordered[i];
      if (u.scoreA !== null && u.scoreB !== null) {
        if (u.scoreA > u.scoreB) aWins++;
        else if (u.scoreB > u.scoreA) bWins++;
        if (aWins >= winsNeeded || bWins >= winsNeeded) return i;
      }
    }
    return -1;
  })();
  const playableUnits = decidedIndex >= 0 ? [...units].sort((x, y) => x.unitNumber - y.unitNumber).slice(0, decidedIndex + 1) : units;
  const firstUnit = playableUnits.find((u) => u.scoreA === null || u.scoreB === null) ?? playableUnits[0];
  const [scoreA, setScoreA] = useState(firstUnit?.scoreA != null ? String(firstUnit.scoreA) : '');
  const [scoreB, setScoreB] = useState(firstUnit?.scoreB != null ? String(firstUnit.scoreB) : '');
  const [error, setError] = useState('');
  const [editingUnitNumber, setEditingUnitNumber] = useState<number | null>(null);

  const currentUnit = editingUnitNumber != null
    ? units.find((u) => u.unitNumber === editingUnitNumber)
    : firstUnit;
  const visibleUnits = playableUnits.filter((unit) =>
    (unit.scoreA !== null && unit.scoreB !== null) ||
    unit.unitNumber === firstUnit?.unitNumber ||
    unit.unitNumber === editingUnitNumber
  );

  const handleSelectUnit = useCallback((unit: ScoreUnit) => {
    setEditingUnitNumber(unit.unitNumber);
    setScoreA(unit.scoreA != null ? String(unit.scoreA) : '');
    setScoreB(unit.scoreB != null ? String(unit.scoreB) : '');
    setError('');
  }, []);

  const handleSave = useCallback(() => {
    if (!currentUnit) return;
    // Strict integers within entry bounds — parseInt would accept "6x".
    if (!/^\d{1,2}$/.test(scoreA.trim()) || !/^\d{1,2}$/.test(scoreB.trim())) {
      setError('Enter valid scores (0–99)');
      if (!/^\d{1,2}$/.test(scoreA.trim())) inputA.current?.focus();
      else inputB.current?.focus();
      return;
    }
    const a = parseInt(scoreA.trim(), 10);
    const b = parseInt(scoreB.trim(), 10);
    const validation = sport.validateUnitScore(a, b, format);
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid score');
      return;
    }
    setError('');
    onSave(currentUnit.unitNumber, a, b);
    onClose();
  }, [scoreA, scoreB, currentUnit, onSave, onClose, sport, format]);

  return (
    <Modal visible={true} animationType="none" transparent onRequestClose={onClose} aria-label="Match score" accessibilityLabel="Match score">
      <ModalSafeArea style={s.overlay}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: Colors.overlay, opacity: backdropOpacity }]} />
      <KeyboardAvoidingView
        style={[s.keyboard, isWide && { justifyContent: 'center', alignItems: 'center' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View onLayout={revealPanel} style={[isWide ? s.dialog : s.sheet, isWide && { width: '100%', maxWidth: MODAL_MAX_WIDTH }, { opacity: panelOpacity, transform: [{ translateY }] }]}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={s.header}>
              <Text style={s.headerTitle}>Score</Text>
              <TouchableOpacity style={s.closeButton} onPress={onClose} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Close score entry">
                <Text style={s.closeText}>Close</Text>
              </TouchableOpacity>
            </View>

            {visibleUnits.length > 1 && (
              <View style={s.completedBox}>
                {visibleUnits.map((u) => {
                  const isEditing = currentUnit?.unitNumber === u.unitNumber;
                  const isFilled = u.scoreA !== null && u.scoreB !== null;
                  return (
                    <TouchableOpacity
                      key={u.unitNumber}
                      style={[
                        s.unitRow,
                        isEditing && s.unitRowActive,
                        isFilled && !isEditing && s.unitRowCompleted,
                      ]}
                      onPress={() => handleSelectUnit(u)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isEditing }}
                      aria-pressed={isEditing}
                    >
                      <Text style={s.unitLabel}>
                        {unitLabel} {u.unitNumber}
                      </Text>
                      <Text style={[s.unitScore, isEditing && s.unitScoreActive]}>
                        {u.scoreA != null && u.scoreB != null
                          ? `${u.scoreA} - ${u.scoreB}`
                          : '—'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {currentUnit && (
              <View style={s.inputBox}>
                {units.length > 1 && <Text style={s.inputLabel}>{unitLabel} {currentUnit.unitNumber}</Text>}
                <View style={s.playerNames}>
                  <Text style={s.playerName} numberOfLines={2}>{playerA}</Text>
                  <Text style={s.playerName} numberOfLines={2}>{playerB}</Text>
                </View>
                <View style={s.inputsRow}>
                  <View style={s.playerColumn}>
                    <AppInput
                      ref={inputA}
                      style={[s.scoreInput, error ? s.scoreInputError : null]}
                      value={scoreA}
                      onChangeText={(value) => { setScoreA(value); setError(''); }}
                      placeholder="0"
                      placeholderTextColor={Colors.textMuted}
                      accessibilityLabel={`${playerA} score`}
                      aria-invalid={error !== ''}
                      keyboardType="number-pad"
                      maxLength={2}
                      autoFocus
                      selectionColor={Colors.primary}
                      selectTextOnFocus
                    />
                  </View>
                  <View style={s.playerColumn}>
                    <AppInput
                      ref={inputB}
                      style={[s.scoreInput, error ? s.scoreInputError : null]}
                      value={scoreB}
                      onChangeText={(value) => { setScoreB(value); setError(''); }}
                      placeholder="0"
                      placeholderTextColor={Colors.textMuted}
                      accessibilityLabel={`${playerB} score`}
                      aria-invalid={error !== ''}
                      keyboardType="number-pad"
                      maxLength={2}
                      selectionColor={Colors.primary}
                      selectTextOnFocus
                    />
                  </View>
                </View>
                {error !== '' && <Text style={s.errorText} accessibilityRole="alert" accessibilityLiveRegion="polite">{error}</Text>}
                <TouchableOpacity
                  style={s.saveBtn}
                  onPress={handleSave}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                >
                  <Text style={s.saveBtnText}>
                    Save score
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
      </ModalSafeArea>
    </Modal>
  );
}
