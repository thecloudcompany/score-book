import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';

interface ByeSectionProps {
  validParticipantCount: number;
  nextPowerOf2: number;
  byesNeeded: number;
  participants: string[];
  byeMethod: 'random' | 'manual';
  selectedByeNames: string[];
  onMethodChange: (method: 'random' | 'manual') => void;
  onSelectedNamesChange: (names: string[]) => void;
}

export function ByeSection({
  validParticipantCount,
  nextPowerOf2,
  byesNeeded,
  participants,
  byeMethod,
  selectedByeNames,
  onMethodChange,
  onSelectedNamesChange,
}: ByeSectionProps) {
  if (validParticipantCount < 2 || byesNeeded === 0) return null;

  const validNames = [...new Set(
    participants.map((p) => p.trim()).filter((p) => p.length > 0)
  )];

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Bye Assignment</Text>
      <Text style={styles.byeInfo}>
        This tournament needs {byesNeeded} bye{byesNeeded > 1 ? 's' : ''} ({validParticipantCount} players, {nextPowerOf2} slots)
      </Text>
      <View style={styles.byeMethodRow}>
        <TouchableOpacity
          style={[styles.byeMethodBtn, byeMethod === 'random' && styles.byeMethodBtnActive]}
          onPress={() => onMethodChange('random')}
          activeOpacity={0.8}
        >
          <Text style={[styles.byeMethodText, byeMethod === 'random' && styles.byeMethodTextActive]}>
            Random
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.byeMethodBtn, byeMethod === 'manual' && styles.byeMethodBtnActive]}
          onPress={() => onMethodChange('manual')}
          activeOpacity={0.8}
        >
          <Text style={[styles.byeMethodText, byeMethod === 'manual' && styles.byeMethodTextActive]}>
            I&apos;ll choose
          </Text>
        </TouchableOpacity>
      </View>

      {byeMethod === 'manual' && (
        <View style={styles.byeSelectionBox}>
          <Text style={styles.byeSelectionLabel}>
            Select {byesNeeded} player{byesNeeded > 1 ? 's' : ''} to skip Round 1:
          </Text>
          {validNames.map((name) => {
            const isSelected = selectedByeNames.includes(name);
            const canSelect = isSelected || selectedByeNames.length < byesNeeded;
            return (
              <TouchableOpacity
                key={name}
                style={[
                  styles.byePlayerRow,
                  isSelected && styles.byePlayerRowSelected,
                  !canSelect && !isSelected && styles.byePlayerRowDisabled,
                ]}
                onPress={() => {
                  if (isSelected) {
                    onSelectedNamesChange(selectedByeNames.filter((n) => n !== name));
                  } else if (canSelect) {
                    onSelectedNamesChange([...selectedByeNames, name]);
                  }
                }}
                activeOpacity={canSelect ? 0.7 : 1}
                disabled={!canSelect && !isSelected}
              >
                <Text style={[styles.byePlayerName, isSelected && styles.byePlayerNameSelected]} numberOfLines={1}>
                  {name}
                </Text>
                {isSelected && <Text style={styles.byeCheckmark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
          <Text style={styles.byeCounter}>
            Selected: {selectedByeNames.length} / {byesNeeded}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  byeInfo: {
    fontFamily: Font.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  byeMethodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  byeMethodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  byeMethodBtnActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  byeMethodText: {
    fontFamily: Font.semibold,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  byeMethodTextActive: {
    color: Colors.primary,
  },
  byeSelectionBox: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  byeSelectionLabel: {
    fontFamily: Font.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  byePlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    marginBottom: 6,
    backgroundColor: Colors.surface,
  },
  byePlayerRowSelected: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  byePlayerRowDisabled: {
    opacity: 0.5,
  },
  byePlayerName: {
    fontFamily: Font.medium,
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  byePlayerNameSelected: {
    color: Colors.primary,
  },
  byeCheckmark: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '600',
  },
  byeCounter: {
    fontFamily: Font.semibold,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
