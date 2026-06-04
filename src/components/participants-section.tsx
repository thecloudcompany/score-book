import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getAllParticipantNames } from '@/lib/db-operations';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';

interface ParticipantsSectionProps {
  participants: string[];
  errors: Record<string, string>;
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function ParticipantsSection({
  participants,
  errors,
  onChange,
  onAdd,
  onRemove,
}: ParticipantsSectionProps) {
  const [pastNames] = useState<{ name: string; lastUsedAt: number }[]>(() => getAllParticipantNames());
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const suggestionsFor = useCallback(
    (index: number): { name: string; lastUsedAt: number }[] => {
      const text = participants[index]?.trim().toLowerCase() ?? '';
      if (text.length < 2) return [];
      return pastNames
        .filter((p) => {
          if (p.name.toLowerCase() === text) return false;
          if (participants.some((other, i) => i !== index && other.trim().toLowerCase() === p.name.toLowerCase())) {
            return false;
          }
          return p.name.toLowerCase().startsWith(text);
        })
        .slice(0, 3);
    },
    [participants, pastNames]
  );

  const visibleSuggestions = useMemo(() => {
    if (focusedIndex === null) return [];
    return suggestionsFor(focusedIndex);
  }, [focusedIndex, suggestionsFor]);

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Players</Text>
      {errors.participants && <Text style={styles.error}>{errors.participants}</Text>}
      {participants.map((p, index) => {
        const showSuggestions = focusedIndex === index && visibleSuggestions.length > 0;
        return (
          <View key={index}>
            <View style={styles.playerRow}>
              <TextInput
                style={styles.playerInput}
                value={p}
                onChangeText={(v) => onChange(index, v)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => {
                  setTimeout(() => setFocusedIndex((curr) => (curr === index ? null : curr)), 100);
                }}
                placeholder={`Player ${index + 1}`}
                placeholderTextColor={Colors.textMuted}
              />
              {participants.length > 2 && (
                <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(index)}>
                  <Text style={styles.removeText}>−</Text>
                </TouchableOpacity>
              )}
            </View>
            {showSuggestions && (
              <View style={styles.suggestionsBox}>
                {visibleSuggestions.map((s) => (
                  <TouchableOpacity
                    key={s.name}
                    style={styles.suggestionRow}
                    onPress={() => {
                      onChange(index, s.name);
                      setFocusedIndex(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionArrow}>↩</Text>
                    <Text style={styles.suggestionName}>{s.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}
      <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.7}>
        <Text style={styles.addBtnText}>+ Add Player</Text>
      </TouchableOpacity>
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
  error: {
    fontFamily: Font.medium,
    fontSize: 13,
    color: Colors.danger,
    marginBottom: Spacing.xs,
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
  suggestionsBox: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: -4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 10,
  },
  suggestionArrow: {
    fontFamily: Font.regular,
    fontSize: 14,
    color: Colors.primary,
  },
  suggestionName: {
    fontFamily: Font.medium,
    fontSize: 14,
    color: Colors.text,
  },
});
