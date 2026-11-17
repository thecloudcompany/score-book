import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ModalSafeArea } from './modal-safe-area';
import { AppInput } from '@/components/app-input';
import { Colors } from '@/constants/theme';
import { s } from './add-players-modal.styles';

interface AddPlayersModalProps {
  existingNames: string[];
  onSubmit: (names: string[]) => string | null;
  onClose: () => void;
}

export function AddPlayersModal({ existingNames, onSubmit, onClose }: AddPlayersModalProps) {
  const [names, setNames] = useState(['']);
  const [error, setError] = useState('');

  const updateName = (index: number, value: string) => {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
    setError('');
  };

  const submit = () => {
    const clean = names.map((n) => n.trim()).filter((n) => n.length > 0);
    if (clean.length === 0) {
      setError('Enter at least one name');
      return;
    }
    const seen = new Set<string>();
    for (const name of clean) {
      if (existingNames.includes(name) || seen.has(name)) {
        setError(`"${name}" is already in the list`);
        return;
      }
      seen.add(name);
    }
    setError(onSubmit(clean) ?? '');
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} accessibilityLabel="Add players" aria-label="Add players">
      <ModalSafeArea style={s.overlay}>
        <KeyboardAvoidingView style={s.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.sheet}>
          <Text style={s.title}>Add players</Text>
          <ScrollView style={s.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {names.map((value, index) => (
              <AppInput
                key={index}
                style={s.input}
                value={value}
                onChangeText={(text) => updateName(index, text)}
                placeholder={`Player ${existingNames.length + index + 1}`}
                placeholderTextColor={Colors.textMuted}
                autoFocus={index === names.length - 1}
                returnKeyType="next"
                onSubmitEditing={() => setNames((prev) => [...prev, ''])}
                selectionColor={Colors.primary}
                accessibilityLabel={`Player ${index + 1} name`}
              />
            ))}
          </ScrollView>
          <TouchableOpacity onPress={() => setNames((prev) => [...prev, ''])} activeOpacity={0.7} style={s.addMore} accessibilityRole="button">
            <Text style={s.addMoreText}>+ Add another</Text>
          </TouchableOpacity>
          {error !== '' && <Text style={s.error}>{error}</Text>}
          <View style={s.actions}>
            <TouchableOpacity style={s.ghostBtn} onPress={onClose} activeOpacity={0.7} accessibilityRole="button">
              <Text style={s.ghostText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.primaryBtn} onPress={submit} activeOpacity={0.85} accessibilityRole="button">
              <Text style={s.primaryText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
        </KeyboardAvoidingView>
      </ModalSafeArea>
    </Modal>
  );
}
