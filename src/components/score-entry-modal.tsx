import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '@/constants/theme';
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
  const firstUnit = units.find((u) => u.scoreA === null || u.scoreB === null) ?? units[0];
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
    const a = parseInt(scoreA, 10);
    const b = parseInt(scoreB, 10);
    if (isNaN(a) || isNaN(b)) {
      setError('Enter valid scores');
      return;
    }
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
    <Modal visible={true} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.sheet}>
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
          {units.length > 0 && (
            <View style={s.completedBox}>
              {units.map((u) => {
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
                      {u.scoreA != null && u.scoreB != null
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
                  keyboardType="number-pad"
                  maxLength={2}
                  autoFocus
                />
                <Text style={s.dashText}>-</Text>
                <TextInput
                  style={[s.scoreInput, error ? s.scoreInputError : null]}
                  value={scoreB}
                  onChangeText={setScoreB}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
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
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
