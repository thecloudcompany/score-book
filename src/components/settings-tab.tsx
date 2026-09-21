import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  LayoutAnimation,
} from 'react-native';
import { s } from './settings-tab.styles';
import { Colors } from '@/constants/theme';
import type { Tournament, Participant } from '@/types';

interface SettingsTabProps {
  tournament: Tournament;
  participants: Participant[];
  onRenameTournament: (newName: string) => void;
  onRenameParticipant: (id: number, newName: string) => void;
  onDeletePress: () => void;
}

export function SettingsTab({
  tournament,
  participants,
  onRenameTournament,
  onRenameParticipant,
  onDeletePress,
}: SettingsTabProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(tournament.name);
  const [editingParticipant, setEditingParticipant] = useState<number | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [participantError, setParticipantError] = useState('');

  const startEditingName = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNameValue(tournament.name);
    setEditingName(true);
  }, [tournament.name]);

  const commitName = useCallback(() => {
    if (nameValue.trim()) {
      onRenameTournament(nameValue.trim());
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditingName(false);
  }, [nameValue, onRenameTournament]);

  const startEditingParticipant = useCallback((id: number, name: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditingParticipant(id);
    setParticipantName(name);
    setParticipantError('');
  }, []);

  const commitParticipantName = useCallback(() => {
    if (editingParticipant != null) {
      const clean = participantName.trim();
      if (!clean) {
        setParticipantError('Name cannot be blank');
        return;
      }
      if (participants.some((p) => p.id !== editingParticipant && p.name === clean)) {
        setParticipantError(`Player "${clean}" already exists`);
        return;
      }
      try {
        onRenameParticipant(editingParticipant, clean);
      } catch (e) {
        setParticipantError(e instanceof Error ? e.message : 'Could not rename player');
        return;
      }
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditingParticipant(null);
    setParticipantError('');
  }, [editingParticipant, participantName, onRenameParticipant, participants]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={s.hero}>
        {editingName ? (
          <TextInput
            style={s.heroInput}
            value={nameValue}
            onChangeText={setNameValue}
            autoFocus
            onBlur={commitName}
            onSubmitEditing={commitName}
            selectTextOnFocus
            selectionColor={Colors.primary}
          />
        ) : (
          <TouchableOpacity onPress={startEditingName} activeOpacity={0.7}>
            <Text style={s.heroTitle}>{tournament.name}</Text>
            <Text style={s.heroHint}>Tap to rename</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={s.metaStrip}>
        <View style={s.metaItem}>
          <View
            style={[
              s.sportDot,
              { backgroundColor: tournament.sport === 'badminton' ? Colors.primary : '#2563EB' },
            ]}
          />
          <Text style={s.metaText}>
            {tournament.sport === 'badminton'
              ? 'Badminton'
              : tournament.sport === 'table_tennis'
                ? 'Table Tennis'
                : tournament.sport === 'pickleball'
                  ? 'Pickleball'
                  : 'Tennis'}
          </Text>
        </View>
        <View style={s.metaDivider} />
        <Text style={s.metaText}>
          {tournament.type === 'knockout' ? 'Knockout' : 'Round Robin'}
        </Text>
      </View>

      <View style={s.rule} />

      <View style={s.sectionHead}>
        <Text style={s.sectionLabel}>Players</Text>
        <View style={s.countBadge}>
          <Text style={s.countText}>{participants.length}</Text>
        </View>
      </View>

      {editingParticipant != null ? (
        <View style={s.editCard}>
          <TextInput
            style={s.editInput}
            value={participantName}
            onChangeText={setParticipantName}
            autoFocus
            onBlur={commitParticipantName}
            onSubmitEditing={commitParticipantName}
            selectTextOnFocus
            selectionColor={Colors.primary}
            accessibilityLabel="Player name"
          />
          {participantError !== '' && <Text style={s.error}>{participantError}</Text>}
        </View>
      ) : (
        <View style={s.roster}>
          {participants.map((p, index) => (
            <TouchableOpacity
              key={p.id}
              style={[s.playerRow, index === participants.length - 1 && s.playerRowLast]}
              onPress={() => startEditingParticipant(p.id, p.name)}
              activeOpacity={0.6}
            >
              <Text style={s.playerIndex}>
                {String(index + 1).padStart(2, '0')}
              </Text>
              <View style={s.playerLine} />
              <Text style={s.playerName}>{p.name}</Text>
              <Text style={s.playerAction}>Edit</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={s.dangerZone}>
        <View style={s.dangerRule} />
        <TouchableOpacity style={s.deleteBtn} onPress={onDeletePress} activeOpacity={0.7}>
          <Text style={s.deleteX}>+</Text>
          <Text style={s.deleteText}>Delete Tournament</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
