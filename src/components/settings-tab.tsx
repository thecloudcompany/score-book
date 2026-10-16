import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  LayoutAnimation,
} from 'react-native';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { s } from './settings-tab.styles';
import { Colors } from '@/constants/theme';
import type { Tournament, Participant } from '@/types';

interface SettingsTabProps {
  tournament: Tournament;
  participants: Participant[];
  maxScore: number;
  hasScores: boolean;
  onRenameTournament: (newName: string) => void;
  onRenameParticipant: (id: number, newName: string) => void;
  onUpdateMaxScore: (newScore: number, resetScores: boolean) => void;
  onDeletePress: () => void;
}

export function SettingsTab({
  tournament,
  participants,
  maxScore,
  hasScores,
  onRenameTournament,
  onRenameParticipant,
  onUpdateMaxScore,
  onDeletePress,
}: SettingsTabProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(tournament.name);
  const [editingParticipant, setEditingParticipant] = useState<number | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [participantError, setParticipantError] = useState('');

  const [editingScore, setEditingScore] = useState(false);
  const [scoreInputValue, setScoreInputValue] = useState(String(maxScore));
  const [scoreError, setScoreError] = useState('');
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [pendingScore, setPendingScore] = useState<number | null>(null);

  const isTennis = tournament.sport === 'tennis';

  useEffect(() => {
    setScoreInputValue(String(maxScore));
  }, [maxScore]);

  const handleStartScoreEdit = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setScoreInputValue(String(maxScore));
    setScoreError('');
    setEditingScore(true);
  }, [maxScore]);

  const handleCancelScoreEdit = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setScoreInputValue(String(maxScore));
    setScoreError('');
    setEditingScore(false);
  }, [maxScore]);

  const handleSaveScore = useCallback(() => {
    const parsed = parseInt(scoreInputValue.trim(), 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 99) {
      setScoreError('Enter a valid score between 1 and 99');
      return;
    }
    if (parsed === maxScore) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setEditingScore(false);
      setScoreError('');
      return;
    }
    if (hasScores) {
      setPendingScore(parsed);
      setShowResetWarning(true);
    } else {
      onUpdateMaxScore(parsed, false);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setEditingScore(false);
      setScoreError('');
    }
  }, [scoreInputValue, maxScore, hasScores, onUpdateMaxScore]);

  const handleConfirmReset = useCallback(() => {
    if (pendingScore !== null) {
      onUpdateMaxScore(pendingScore, true);
    }
    setShowResetWarning(false);
    setPendingScore(null);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditingScore(false);
    setScoreError('');
  }, [pendingScore, onUpdateMaxScore]);

  const handleCancelReset = useCallback(() => {
    setShowResetWarning(false);
    setPendingScore(null);
  }, []);

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
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
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
        <Text style={s.sectionLabel}>Match Format</Text>
      </View>

      {editingScore ? (
        <View style={s.formatEditCard}>
          <View style={s.formatEditHeader}>
            <Text style={s.formatEditTitle}>
              {isTennis ? 'Games per Set' : 'Points to Win'}
            </Text>
            <Text style={s.formatEditHint}>
              {isTennis
                ? 'Enter number of games needed to win a set (1–99)'
                : 'Enter number of points needed to win a game (1–99)'}
            </Text>
          </View>
          <View style={s.formatEditRow}>
            <TextInput
              style={s.formatInput}
              value={scoreInputValue}
              onChangeText={(text) => {
                setScoreInputValue(text.replace(/[^0-9]/g, ''));
                setScoreError('');
              }}
              keyboardType="number-pad"
              maxLength={2}
              autoFocus
              selectTextOnFocus
              selectionColor={Colors.primary}
              onSubmitEditing={handleSaveScore}
              returnKeyType="done"
              accessibilityLabel={isTennis ? 'Games per set' : 'Points to win'}
            />
            <View style={s.formatActions}>
              <TouchableOpacity
                style={s.formatCancelBtn}
                onPress={handleCancelScoreEdit}
                activeOpacity={0.7}
              >
                <Text style={s.formatCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.formatSaveBtn}
                onPress={handleSaveScore}
                activeOpacity={0.8}
              >
                <Text style={s.formatSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
          {scoreError !== '' && (
            <Text style={[s.error, { paddingHorizontal: 0, paddingTop: 6, paddingBottom: 0 }]}>
              {scoreError}
            </Text>
          )}
        </View>
      ) : (
        <View style={s.formatCard}>
          <TouchableOpacity
            style={s.formatRow}
            onPress={handleStartScoreEdit}
            activeOpacity={0.6}
          >
            <View style={s.formatInfo}>
              <Text style={s.formatTitle}>
                {isTennis ? 'Games per Set' : 'Points to Win'}
              </Text>
              <Text style={s.formatSubtitle}>
                {isTennis
                  ? 'Games required to win each set'
                  : 'Points required to win each game'}
              </Text>
            </View>
            <View style={s.formatValueBox}>
              <Text style={s.formatValue}>
                {maxScore} <Text style={s.formatUnit}>{isTennis ? 'games' : 'pts'}</Text>
              </Text>
              <Text style={s.playerAction}>Edit</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={s.sectionSpacer} />

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
              <Text style={s.playerName} numberOfLines={1}>{p.name}</Text>
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

      <ConfirmDialog
        visible={showResetWarning}
        title="Reset Tournament Scores?"
        message="Scores have already been entered for this tournament. Changing the max score will reset all match scores and standings. This cannot be undone. Do you want to continue?"
        confirmText="Reset & Update"
        cancelText="Cancel"
        destructive
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
      />
    </ScrollView>
  );
}
