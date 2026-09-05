import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Colors } from '@/constants/theme';
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
    <Modal visible={true} animationType={isWide ? 'fade' : 'slide'} transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[s.overlay, isWide && { justifyContent: 'center', alignItems: 'center' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[isWide ? s.dialog : s.sheet, isWide && { width: '100%', maxWidth: MODAL_MAX_WIDTH }]}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={s.header}>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Text style={s.closeText}>Close</Text>
              </TouchableOpacity>
              <Text style={s.headerTitle}>Score Entry</Text>
              <View style={{ width: 50 }} />
            </View>

            {/* Players */}
            <View style={s.playersRow}>
              <Text style={s.playerName}>{playerA}</Text>
              <Text style={s.vsText}>vs</Text>
              <Text style={s.playerName}>{playerB}</Text>
            </View>

            {/* Units list — all games, tap to edit */}
            {playableUnits.length > 0 && (
              <View style={s.completedBox}>
                {playableUnits.map((u) => {
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
                    >
                      <Text style={s.unitLabel}>
                        {unitLabel} {u.unitNumber}
                      </Text>
                      <Text style={[s.unitScore, isEditing && s.unitScoreActive]}>
                        {u.scoreA != null && u.scoreB !== null
                          ? `${u.scoreA} - ${u.scoreB}`
                          : '—'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Current unit input */}
            {currentUnit && (
              <View style={s.inputBox}>
                <Text style={s.inputLabel}>
                  {editingUnitNumber != null ? 'Edit' : 'Enter'} {unitLabel} {currentUnit.unitNumber}
                </Text>
                <View style={s.inputsRow}>
                  <TextInput
                    style={[s.scoreInput, error ? s.scoreInputError : null]}
                    value={scoreA}
                    onChangeText={setScoreA}
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                    accessibilityLabel={`${playerA} score`}
                    keyboardType="number-pad"
                    maxLength={2}
                    autoFocus
                    selectionColor={Colors.primary}
                  />
                  <Text style={s.dashText}>-</Text>
                  <TextInput
                    style={[s.scoreInput, error ? s.scoreInputError : null]}
                    value={scoreB}
                    onChangeText={setScoreB}
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                    accessibilityLabel={`${playerB} score`}
                    keyboardType="number-pad"
                    maxLength={2}
                    selectionColor={Colors.primary}
                  />
                </View>
                {error !== '' && <Text style={s.errorText}>{error}</Text>}
                <TouchableOpacity
                  style={[s.saveBtn, !(scoreA && scoreB) && s.saveBtnDisabled]}
                  onPress={handleSave}
                  activeOpacity={0.8}
                  disabled={!(scoreA && scoreB)}
                >
                  <Text style={s.saveBtnText}>
                    {editingUnitNumber != null ? 'Update Score' : 'Save Score'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
