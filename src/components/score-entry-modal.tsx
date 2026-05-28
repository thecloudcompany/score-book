import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';

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
  onSave: (unitNumber: number, scoreA: number, scoreB: number) => void;
  onClose: () => void;
}

export default function ScoreEntryModal({
  playerA,
  playerB,
  unitLabel,
  units,
  onSave,
  onClose,
}: ScoreEntryModalProps) {
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [error, setError] = useState('');
  const [editingUnitNumber, setEditingUnitNumber] = useState<number | null>(null);

  // Find first empty unit, or editing unit, or first unit if all filled
  const currentUnit = editingUnitNumber != null
    ? units.find((u) => u.unitNumber === editingUnitNumber)
    : units.find((u) => u.scoreA === null || u.scoreB === null) ?? units[0];

  // Pre-fill inputs when current unit changes (initial mount or user selection)
  useEffect(() => {
    if (currentUnit) {
      setScoreA(currentUnit.scoreA != null ? String(currentUnit.scoreA) : '');
      setScoreB(currentUnit.scoreB != null ? String(currentUnit.scoreB) : '');
    }
  }, [currentUnit?.unitNumber]);

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
    if (a < 0 || b < 0) {
      setError('Scores must be positive');
      return;
    }
    if (a === b) {
      setError('Scores cannot tie');
      return;
    }
    setError('');
    onSave(currentUnit.unitNumber, a, b);
    onClose();
  }, [scoreA, scoreB, currentUnit, onSave, onClose]);

  return (
    <Modal visible={true} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bgElevated,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    paddingBottom: 48,
    maxHeight: '88%',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  closeText: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.textMuted,
  },
  headerTitle: {
    fontFamily: Font.bold,
    fontSize: 17,
    color: Colors.text,
  },
  playersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  playerName: {
    fontFamily: Font.bold,
    fontSize: 18,
    color: Colors.text,
  },
  vsText: {
    fontFamily: Font.medium,
    fontSize: 13,
    color: Colors.textMuted,
  },
  completedBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  unitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    borderRadius: Radius.sm,
  },
  unitRowActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
    borderWidth: 1,
    borderBottomWidth: 1,
  },
  unitRowCompleted: {
    opacity: 0.7,
  },
  unitLabel: {
    fontFamily: Font.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  unitScore: {
    fontFamily: Font.bold,
    fontSize: 15,
    color: Colors.text,
  },
  unitScoreActive: {
    color: Colors.primary,
  },
  inputBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    padding: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontFamily: Font.semibold,
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: Spacing.lg,
  },
  scoreInput: {
    fontFamily: Font.extrabold,
    fontSize: 36,
    color: Colors.text,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    width: 96,
    height: 80,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreInputError: {
    borderColor: Colors.warning,
  },
  dashText: {
    fontFamily: Font.medium,
    fontSize: 20,
    color: Colors.textMuted,
  },
  errorText: {
    fontFamily: Font.medium,
    fontSize: 13,
    color: Colors.warning,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.5,
  },
  saveBtnText: {
    fontFamily: Font.bold,
    fontSize: 16,
    color: Colors.textInverse,
  },
});
