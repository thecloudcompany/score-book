import { useState, useCallback, Children, Fragment, type ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
} from 'react-native';
import { AppInput } from '@/components/app-input';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PoolSettingsSection } from '@/components/pool-settings-section';
import { AddPlayersModal } from '@/components/add-players-modal';
import { s } from './settings-tab.styles';
import { Colors, Motion } from '@/constants/theme';
import { useReducedMotionPreference } from '@/hooks/use-reduced-motion';
import type { PoolAdvancement } from '@/lib/pool-rules';
import type { Pool, Tournament, Participant } from '@/types';

export interface PoolSettingsActions {
  onUpdateAdvancement: (patch: Omit<PoolAdvancement, 'poolCount'>) => string | null;
}

interface SettingsTabProps {
  tournament: Tournament;
  participants: Participant[];
  maxScore: number;
  hasScores: boolean;
  poolSettings: PoolSettingsActions | null;
  canAddPlayers: boolean;
  pools?: Pool[];
  onRenameTournament: (newName: string) => void;
  onRenameParticipant: (id: number, newName: string) => void;
  onUpdateMaxScore: (newScore: number, resetScores: boolean) => void;
  onAddLatePlayer: (name: string) => string | null;
  onDeletePress: () => void;
}

function Section({
  title,
  right,
  open,
  onToggle,
  children,
}: {
  title: string;
  right?: ReactNode;
  open?: boolean;
  onToggle?: () => void;
  children?: ReactNode;
}) {
  const rows = Children.toArray(children).filter(Boolean);
  const expanded = onToggle ? open : true;
  return (
    <View style={s.section}>
      <View style={s.sectionHead}>
        {onToggle ? (
          <TouchableOpacity
            style={s.accordionHead}
            onPress={onToggle}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityState={{ expanded: !!open }}
          >
            <Text style={s.sectionTitle}>{title}</Text>
            <Text style={s.chevron}>{open ? '▼' : '▶'}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={s.sectionTitle}>{title}</Text>
        )}
        {right}
      </View>
      {expanded && rows.length > 0 && (
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
  value,
  action,
  right,
  onPress,
  indent,
}: {
  title: string;
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
  canAddPlayers,
  pools,
  onRenameTournament,
  onRenameParticipant,
  onUpdateMaxScore,
  onAddLatePlayer,
  onDeletePress,
}: SettingsTabProps) {
  const reduceMotion = useReducedMotionPreference();
  const animate = useCallback(() => {
    if (reduceMotion || Platform.OS === 'web') return;
    LayoutAnimation.configureNext({
      ...LayoutAnimation.Presets.easeInEaseOut,
      duration: Motion.duration.layout,
    });
  }, [reduceMotion]);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(tournament.name);
  const [editingParticipant, setEditingParticipant] = useState<number | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [participantError, setParticipantError] = useState('');
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [openPlayers, setOpenPlayers] = useState(true);
  const [openPoolIds, setOpenPoolIds] = useState<number[]>([]);

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
    animate();
    setOpenPoolIds((prev) => (prev.includes(poolId) ? prev.filter((id) => id !== poolId) : [...prev, poolId]));
  }, [animate]);

  const handleStartScoreEdit = useCallback(() => {
    animate();
    setScoreInputValue(String(maxScore));
    setScoreError('');
    setEditingScore(true);
  }, [maxScore, animate]);

  const handleCancelScoreEdit = useCallback(() => {
    animate();
    setScoreInputValue(String(maxScore));
    setScoreError('');
    setEditingScore(false);
  }, [maxScore, animate]);

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
  }, [scoreInputValue, maxScore, hasScores, onUpdateMaxScore, animate]);

  const handleConfirmReset = useCallback(() => {
    if (pendingScore !== null) {
      onUpdateMaxScore(pendingScore, true);
    }
    setShowResetWarning(false);
    setPendingScore(null);
    animate();
    setEditingScore(false);
    setScoreError('');
  }, [pendingScore, onUpdateMaxScore, animate]);

  const handleCancelReset = useCallback(() => {
    setShowResetWarning(false);
    setPendingScore(null);
  }, []);

  const startEditingName = useCallback(() => {
    animate();
    setNameValue(tournament.name);
    setEditingName(true);
  }, [tournament.name, animate]);

  const commitName = useCallback(() => {
    if (nameValue.trim()) {
      onRenameTournament(nameValue.trim());
    }
    animate();
    setEditingName(false);
  }, [nameValue, onRenameTournament, animate]);

  const startEditingParticipant = useCallback((id: number, name: string) => {
    animate();
    setEditingParticipant(id);
    setParticipantName(name);
    setParticipantError('');
  }, [animate]);

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
  }, [editingParticipant, participantName, onRenameParticipant, participants, animate]);

  const submitNewPlayers = useCallback(
    (names: string[]): string | null => {
      for (const name of names) {
        const error = onAddLatePlayer(name);
        if (error) return error;
      }
      animate();
      setAddingPlayer(false);
      return null;
    },
    [onAddLatePlayer, animate]
  );

  const renderPlayer = (p: Participant, indent: boolean) =>
    editingParticipant === p.id ? (
      <View key={p.id} style={s.editor}>
        <AppInput
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
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
      <View style={s.header}>
        {editingName ? (
          <AppInput
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
            <TouchableOpacity style={s.inlineAction} onPress={startEditingName} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Change name">
              <Text style={s.rename}>Change</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Section
        title="Scoring"
        right={
          editingScore ? null : (
            <View style={s.sectionValue}>
              <Text style={s.rowValue}>{maxScore} {isTennis ? 'games' : 'points'}</Text>
              <TouchableOpacity style={s.inlineAction} onPress={handleStartScoreEdit} activeOpacity={0.6} accessibilityRole="button" accessibilityLabel="Change scoring">
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
            <AppInput
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

      {poolSettings && poolsStarted && (
        <Section title="Knockout">
            <PoolSettingsSection
              tournament={tournament}
              playerCount={participants.length}
              onUpdateAdvancement={poolSettings.onUpdateAdvancement}
            />
        </Section>
      )}

      <Section
        title={`Players (${participants.length})`}
        open={openPlayers}
        onToggle={() => {
          animate();
          setOpenPlayers((open) => !open);
        }}
        right={
          canAddPlayers ? (
            <TouchableOpacity
              style={s.addIconBtn}
              onPress={() => setAddingPlayer(true)}
              activeOpacity={0.7}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Add players"
            >
              <Text style={s.addIconText}>+</Text>
            </TouchableOpacity>
          ) : null
        }
      >
        {renderRoster()}
      </Section>
      {addingPlayer && (
        <AddPlayersModal
          existingNames={participants.map((p) => p.name)}
          onSubmit={submitNewPlayers}
          onClose={() => setAddingPlayer(false)}
        />
      )}

      <TouchableOpacity style={s.deleteBtn} onPress={onDeletePress} activeOpacity={0.7} accessibilityRole="button">
        <Text style={s.deleteText}>Delete tournament</Text>
      </TouchableOpacity>

      <ConfirmDialog
        visible={showResetWarning}
        title="Reset scores?"
        message="Changing scoring clears all results. This cannot be undone."
        confirmText="Reset and update"
        cancelText="Cancel"
        destructive
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
      />
    </ScrollView>
  );
}
