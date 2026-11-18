import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Pencil, Plus, Minus, CornerDownLeft } from 'lucide-react-native';
import { AppInput } from '@/components/app-input';
import { ModalSafeArea } from './modal-safe-area';
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
  const [editing, setEditing] = useState(false);
  const names = participants.map((name) => name.trim()).filter(Boolean);

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
      <View style={styles.summaryHead}>
        <Text style={styles.label}>Players{names.length > 0 ? ` (${names.length})` : ''}</Text>
        {names.length > 0 && (
          <TouchableOpacity style={styles.summaryAction} onPress={() => setEditing(true)} accessibilityRole="button" accessibilityLabel="Edit players">
            <Pencil size={14} color={Colors.primary} /><Text style={styles.addBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      {names.length > 0 ? (
        <Text style={styles.summaryNames} numberOfLines={2}>{names.join(', ')}</Text>
      ) : (
        <TouchableOpacity style={styles.emptyAdd} onPress={() => setEditing(true)} accessibilityRole="button">
          <Plus size={16} color={Colors.primary} strokeWidth={2.6} /><Text style={styles.addBtnText}>Add players</Text>
        </TouchableOpacity>
      )}
      {errors.participants && <Text style={styles.error}>{errors.participants}</Text>}
      <Modal visible={editing} transparent animationType="fade" onRequestClose={() => setEditing(false)} aria-label="Players" accessibilityLabel="Players">
        <ModalSafeArea style={styles.overlay}>
        <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.sheet}>
            <View style={styles.editorHead}>
              <Text style={styles.editorTitle}>Players</Text>
              <TouchableOpacity style={styles.summaryAction} onPress={() => setEditing(false)} accessibilityRole="button">
                <Text style={styles.addBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {participants.map((p, index) => {
                const showSuggestions = focusedIndex === index && visibleSuggestions.length > 0;
                return (
                  <View key={index}>
                    <View style={styles.playerRow}>
                      <AppInput
                        style={styles.playerInput}
                        value={p}
                        onChangeText={(v) => onChange(index, v)}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => {
                          setTimeout(() => setFocusedIndex((curr) => (curr === index ? null : curr)), 100);
                        }}
                        placeholder={`Player ${index + 1}`}
                        accessibilityLabel={`Player ${index + 1}`}
                        autoFocus={index === 0}
                        placeholderTextColor={Colors.textMuted}
                        selectionColor={Colors.primary}
                      />
                      {participants.length > 2 && (
                        <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(index)} accessibilityRole="button" accessibilityLabel={`Remove player ${index + 1}`}>
                          <Minus size={16} color={Colors.danger} strokeWidth={2.6} />
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
                            accessibilityRole="button"
                          >
                            <CornerDownLeft size={14} color={Colors.textMuted} />
                            <Text style={styles.suggestionName}>{s.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
              <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.7} accessibilityRole="button">
                <Plus size={16} color={Colors.primary} strokeWidth={2.6} /><Text style={styles.addBtnText}>Add player</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
        </ModalSafeArea>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: Spacing.lg,
  },
  label: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.textSecondary,
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
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1.5,
  },
  removeBtn: {
    width: 48,
    height: 48,
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
    marginTop: 2,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
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
  summaryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 32 },
  summaryAction: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', paddingHorizontal: Spacing.md, borderRadius: Radius.full, backgroundColor: Colors.primaryMuted },
  summaryNames: { fontFamily: Font.regular, fontSize: 14, lineHeight: 20, color: Colors.textSecondary },
  emptyAdd: {
    minHeight: 48,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryMuted,
    marginTop: Spacing.xs,
  },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.overlay, padding: Spacing.lg },
  keyboard: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  sheet: { width: '100%', maxWidth: 480, maxHeight: '100%', paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, backgroundColor: Colors.bg, borderRadius: 20 },
  editorHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  editorTitle: { fontFamily: Font.bold, fontSize: 17, color: Colors.text },
});
