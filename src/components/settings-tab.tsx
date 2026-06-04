import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { s } from './settings-tab.styles';
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

  const commitTournamentName = () => {
    if (nameValue.trim()) {
      onRenameTournament(nameValue.trim());
    }
    setEditingName(false);
  };

  const commitParticipantName = () => {
    if (editingParticipant != null) {
      onRenameParticipant(editingParticipant, participantName);
      setEditingParticipant(null);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={s.card}>
        <Text style={s.label}>Tournament Name</Text>
        {editingName ? (
          <TextInput
            style={s.input}
            value={nameValue}
            onChangeText={setNameValue}
            autoFocus
            onBlur={commitTournamentName}
            onSubmitEditing={commitTournamentName}
          />
        ) : (
          <TouchableOpacity onPress={() => setEditingName(true)} activeOpacity={0.7}>
            <Text style={s.value}>{tournament.name}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={s.card}>
        <Text style={s.label}>Sport</Text>
        <Text style={s.value}>
          {tournament.sport === 'badminton' ? '🏸 Badminton' : '🎾 Tennis'}
        </Text>
      </View>

      <View style={s.card}>
        <Text style={s.label}>Players</Text>
        {editingParticipant != null ? (
          <TextInput
            style={s.input}
            value={participantName}
            onChangeText={setParticipantName}
            autoFocus
            onBlur={commitParticipantName}
            onSubmitEditing={commitParticipantName}
          />
        ) : (
          <View>
            {participants.map((p, index) => (
              <View key={p.id}>
                <TouchableOpacity
                  style={s.playerRow}
                  onPress={() => {
                    setEditingParticipant(p.id);
                    setParticipantName(p.name);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={s.playerText}>{p.name}</Text>
                  <Text style={s.playerHint}>Edit</Text>
                </TouchableOpacity>
                {index < participants.length - 1 && <View style={s.divider} />}
              </View>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity style={s.deleteBtn} onPress={onDeletePress} activeOpacity={0.8}>
        <Text style={s.deleteBtnText}>Delete Tournament</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
