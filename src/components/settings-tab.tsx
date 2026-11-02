import { useState, useCallback, Children, Fragment, type ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  LayoutAnimation,
  Switch,
} from 'react-native';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PoolSettingsSection } from '@/components/pool-settings-section';
import { s } from './settings-tab.styles';
import { Colors } from '@/constants/theme';
import type { PoolAdvancement } from '@/lib/pool-rules';
import { playFormatLabel, SPORT_LABELS } from '@/lib/tournament-labels';
import type { Pool, Tournament, Participant } from '@/types';

export interface LateAdditionsState {
  enabled: boolean;
  closed: boolean;
  closedNote: string;
  canClose: boolean;
}

export interface PoolSettingsActions {
  onStartPools: (settings: PoolAdvancement) => string | null;
  onUpdateAdvancement: (patch: Omit<PoolAdvancement, 'poolCount'>) => string | null;
}

interface SettingsTabProps {
  tournament: Tournament;
  participants: Participant[];
  maxScore: number;
  hasScores: boolean;
  poolSettings: PoolSettingsActions | null;
  lateAdditions: LateAdditionsState | null;
  pools?: Pool[];
  onRenameTournament: (newName: string) => void;
  onRenameParticipant: (id: number, newName: string) => void;
  onUpdateMaxScore: (newScore: number, resetScores: boolean) => void;
  onToggleLateAdditions: (enabled: boolean) => void;
  onAddLatePlayer: (name: string) => string | null;
  onEndLateAdditions: () => void;
  onDeletePress: () => void;
}

const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

function Section({ title, right, children }: { title: string; right?: ReactNode; children?: ReactNode }) {
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View style={s.section}>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>{title}</Text>
        {right}
      </View>
      {rows.length > 0 && (
        <View style={s.card}>
          {rows.map((child, index) => (
            <Fragment key={index}>
              {index > 0 && <View style={s.divider} />}
              {child}
            </Fragment>
          ))}
        </View>
      )}
    </View>
  );
}

function Row({
  title,
  subtitle,
  value,
  action,
  right,
  onPress,
  indent,
}: {
  title: string;
  subtitle?: string;
  value?: string;
  action?: string;
  right?: ReactNode;
  onPress?: () => void;
  indent?: boolean;
}) {
  const content = (
    <>
      <View style={s.rowText}>
        <Text style={[s.rowTitle, indent && s.rowTitleIndent]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle !== undefined && <Text style={s.rowSubtitle}>{subtitle}</Text>}
      </View>
      {value !== undefined && <Text style={s.rowValue}>{value}</Text>}
      {right ?? (action !== undefined && <Text style={s.rowAction}>{action}</Text>)}
    </>
  );
  if (!onPress) return <View style={[s.row, indent && s.rowIndent]}>{content}</View>;
  return (
    <TouchableOpacity
      style={[s.row, indent && s.rowIndent]}
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityRole="button"
    >
      {content}
    </TouchableOpacity>
  );
}

export function SettingsTab({
  tournament,
  participants,
  maxScore,
  hasScores,
  poolSettings,
  lateAdditions,
  pools,
  onRenameTournament,
  onRenameParticipant,
  onUpdateMaxScore,
  onToggleLateAdditions,
  onAddLatePlayer,
  onEndLateAdditions,
  onDeletePress,
}: SettingsTabProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(tournament.name);
  const [editingParticipant, setEditingParticipant] = useState<number | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [participantError, setParticipantError] = useState('');
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerError, setNewPlayerError] = useState('');
  const [confirmEndLate, setConfirmEndLate] = useState(false);
  const [openPoolIds, setOpenPoolIds] = useState<number[]>([]);
  const [showGroups, setShowGroups] = useState(false);

  const [editingScore, setEditingScore] = useState(false);
  const [scoreInputValue, setScoreInputValue] = useState(String(maxScore));
  const [syncedMaxScore, setSyncedMaxScore] = useState(maxScore);
  const [scoreError, setScoreError] = useState('');
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [pendingScore, setPendingScore] = useState<number | null>(null);

  const isTennis = tournament.sport === 'tennis';
  const poolsStarted = tournament.stage === 'pools' || tournament.stage === 'knockout';
  const canGroupPools = poolsStarted && (pools?.length ?? 0) > 0;

  // Keep the score draft in step with the saved value, without an effect.
  if (maxScore !== syncedMaxScore) {
    setSyncedMaxScore(maxScore);
    setScoreInputValue(String(maxScore));
  }

  const togglePool = useCallback((poolId: number) => {
    setOpenPoolIds((prev) => (prev.includes(poolId) ? prev.filter((id) => id !== poolId) : [...prev, poolId]));
  }, []);

  const handleStartScoreEdit = useCallback(() => {
    animate();
    setScoreInputValue(String(maxScore));
    setScoreError('');
    setEditingScore(true);
  }, [maxScore]);

  const handleCancelScoreEdit = useCallback(() => {
    animate();
    setScoreInputValue(String(maxScore));
    setScoreError('');
    setEditingScore(false);
  }, [maxScore]);

  const handleSaveScore = useCallback(() => {
    const parsed = parseInt(scoreInputValue.trim(), 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 99) {
      setScoreError('Enter a number from 1 to 99');
      return;
    }
    if (parsed === maxScore) {
      animate();
      setEditingScore(false);
      setScoreError('');
      return;
    }
    if (hasScores) {
      setPendingScore(parsed);
      setShowResetWarning(true);
    } else {
      onUpdateMaxScore(parsed, false);
      animate();
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
    animate();
    setEditingScore(false);
    setScoreError('');
  }, [pendingScore, onUpdateMaxScore]);

  const handleCancelReset = useCallback(() => {
    setShowResetWarning(false);
    setPendingScore(null);
  }, []);

  const startEditingName = useCallback(() => {
    animate();
    setNameValue(tournament.name);
    setEditingName(true);
  }, [tournament.name]);

  const commitName = useCallback(() => {
    if (nameValue.trim()) {
      onRenameTournament(nameValue.trim());
    }
    animate();
    setEditingName(false);
  }, [nameValue, onRenameTournament]);

  const startEditingParticipant = useCallback((id: number, name: string) => {
    animate();
    setEditingParticipant(id);
    setParticipantName(name);
    setParticipantError('');
  }, []);

  const commitParticipantName = useCallback(() => {
    if (editingParticipant != null) {
      const clean = participantName.trim();
      if (!clean) {
        setParticipantError('Name cannot be empty');
        return;
      }
      if (participants.some((p) => p.id !== editingParticipant && p.name === clean)) {
        setParticipantError(`"${clean}" is already in the list`);
        return;
      }
      try {
        onRenameParticipant(editingParticipant, clean);
      } catch (e) {
        setParticipantError(e instanceof Error ? e.message : 'Could not change the name');
        return;
      }
    }
    animate();
    setEditingParticipant(null);
    setParticipantError('');
  }, [editingParticipant, participantName, onRenameParticipant, participants]);

  const submitNewPlayer = useCallback(() => {
    const clean = newPlayerName.trim();
    if (!clean) {
      setNewPlayerError('Enter a name');
      return;
    }
    const error = onAddLatePlayer(clean);
    if (error) {
      setNewPlayerError(error);
      return;
    }
    animate();
    setNewPlayerName('');
    setNewPlayerError('');
    setAddingPlayer(false);
  }, [newPlayerName, onAddLatePlayer]);

  const renderPlayer = (p: Participant, indent: boolean) =>
    editingParticipant === p.id ? (
      <View key={p.id} style={s.editor}>
        <TextInput
          style={s.editorInput}
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
      <Row key={p.id} title={p.name} action="Change" indent={indent} onPress={() => startEditingParticipant(p.id, p.name)} />
    );

  const renderRoster = () => {
    if (!canGroupPools) return participants.map((p) => renderPlayer(p, false));
    return (pools ?? []).flatMap((pool) => {
      const members = participants.filter((p) => p.poolId === pool.id);
      const open = openPoolIds.includes(pool.id);
      return [
        <Row
          key={`pool-${pool.id}`}
          title={pool.name}
          value={`${members.length} players`}
          action={open ? 'Hide' : 'Show'}
          onPress={() => togglePool(pool.id)}
        />,
        ...(open ? members.map((p) => renderPlayer(p, true)) : []),
      ];
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.header}>
        {editingName ? (
          <TextInput
            style={s.nameInput}
            value={nameValue}
            onChangeText={setNameValue}
            autoFocus
            onBlur={commitName}
            onSubmitEditing={commitName}
            selectTextOnFocus
            selectionColor={Colors.primary}
            accessibilityLabel="Tournament name"
          />
        ) : (
          <View style={s.nameRow}>
            <Text style={s.name} numberOfLines={1}>{tournament.name}</Text>
            <TouchableOpacity onPress={startEditingName} activeOpacity={0.7} hitSlop={8} accessibilityRole="button" accessibilityLabel="Change name">
              <Text style={s.rename}>Change</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={s.subtitle}>
          {SPORT_LABELS[tournament.sport]}, {playFormatLabel(tournament)}
        </Text>
      </View>

      <Section
        title="Scoring"
        right={
          editingScore ? null : (
            <View style={s.sectionValue}>
              <Text style={s.rowValue}>{maxScore} {isTennis ? 'games' : 'points'}</Text>
              <TouchableOpacity onPress={handleStartScoreEdit} activeOpacity={0.6} hitSlop={8} accessibilityRole="button">
                <Text style={s.rowAction}>Change</Text>
              </TouchableOpacity>
            </View>
          )
        }
      >
        {editingScore && (
          <View style={s.editor}>
            <Text style={s.editorLabel}>
              {isTennis ? 'Games needed to win a set' : 'Points needed to win a game'}
            </Text>
            <TextInput
              style={s.editorInput}
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
            {scoreError !== '' && <Text style={s.error}>{scoreError}</Text>}
            <View style={s.editorActions}>
              <TouchableOpacity style={s.ghostBtn} onPress={handleCancelScoreEdit} activeOpacity={0.7}>
                <Text style={s.ghostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.primaryBtn} onPress={handleSaveScore} activeOpacity={0.85}>
                <Text style={s.primaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Section>

      <Section title={`Players (${participants.length})`}>
        {renderRoster()}
        {addingPlayer && (
          <View style={s.editor}>
            <TextInput
              style={s.editorInput}
              value={newPlayerName}
              onChangeText={(text) => {
                setNewPlayerName(text);
                setNewPlayerError('');
              }}
              placeholder="Player name"
              placeholderTextColor={Colors.textMuted}
              autoFocus
              onSubmitEditing={submitNewPlayer}
              returnKeyType="done"
              selectionColor={Colors.primary}
              accessibilityLabel="New player name"
            />
            {newPlayerError !== '' && <Text style={s.error}>{newPlayerError}</Text>}
            <View style={s.editorActions}>
              <TouchableOpacity
                style={s.ghostBtn}
                onPress={() => {
                  setAddingPlayer(false);
                  setNewPlayerName('');
                  setNewPlayerError('');
                }}
                activeOpacity={0.7}
              >
                <Text style={s.ghostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.primaryBtn} onPress={submitNewPlayer} activeOpacity={0.85}>
                <Text style={s.primaryText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Section>

      {poolSettings && (
        <Section title="Groups and knockout">
          <Row
            title={poolsStarted ? 'Knockout' : 'Groups'}
            value={poolsStarted ? `${tournament.startingSlots ?? 0} go through` : 'Not split yet'}
            action={showGroups ? 'Hide' : 'Open'}
            onPress={() => {
              animate();
              setShowGroups((open) => !open);
            }}
          />
          {showGroups && (
            <PoolSettingsSection
              tournament={tournament}
              playerCount={participants.length}
              hasScores={hasScores}
              onStartPools={poolSettings.onStartPools}
              onUpdateAdvancement={poolSettings.onUpdateAdvancement}
            />
          )}
        </Section>
      )}

      {lateAdditions && (
        <Section title="Add players later">
          <Row
            title="Let new players join"
            subtitle={lateAdditions.closed ? lateAdditions.closedNote : undefined}
            right={
              <Switch
                value={lateAdditions.enabled}
                onValueChange={onToggleLateAdditions}
                disabled={lateAdditions.closed}
                trackColor={{ true: Colors.primary }}
                accessibilityLabel="Let new players join"
              />
            }
          />
          {lateAdditions.enabled && !lateAdditions.closed && !addingPlayer && (
            <Row title="Add a player" action="Add" onPress={() => setAddingPlayer(true)} />
          )}
          {lateAdditions.canClose && lateAdditions.enabled && !lateAdditions.closed && !addingPlayer && (
            <Row
              title="Stop adding players"
              action="Stop"
              onPress={() => setConfirmEndLate(true)}
            />
          )}
        </Section>
      )}

      <TouchableOpacity style={s.deleteBtn} onPress={onDeletePress} activeOpacity={0.7}>
        <Text style={s.deleteText}>Delete tournament</Text>
      </TouchableOpacity>

      <ConfirmDialog
        visible={showResetWarning}
        title="Reset scores?"
        message="Scores have already been entered for this tournament. Changing the points will reset all match scores and standings. This cannot be undone. Do you want to continue?"
        confirmText="Reset and update"
        cancelText="Cancel"
        destructive
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
      />
      <ConfirmDialog
        visible={confirmEndLate}
        title="Stop adding players?"
        message="No new players can join this tournament after this."
        confirmText="Stop"
        cancelText="Cancel"
        destructive
        onConfirm={() => {
          setConfirmEndLate(false);
          onEndLateAdditions();
        }}
        onCancel={() => setConfirmEndLate(false)}
      />
    </ScrollView>
  );
}
