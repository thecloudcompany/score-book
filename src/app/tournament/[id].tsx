import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import ScoreEntryModal from '@/components/score-entry-modal';
import {
  getTournament,
  getParticipants,
  updateParticipantName,
  updateTournamentName,
  deleteTournament,
} from '@/lib/db-operations';
import { useMatches } from '@/hooks/use-matches';
import { useStandings } from '@/hooks/use-standings';
import { Font, Colors, Radius, Spacing, statusColor } from '@/constants/theme';
import type { Tournament, MatchStatus } from '@/types';

type TabType = 'matches' | 'standings' | 'settings';

function StatusDot({ status }: { status: MatchStatus }) {
  return (
    <View style={[styles.statusDot, { backgroundColor: statusColor(status) }]} />
  );
}

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const tournamentId = Number(id);

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('matches');
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [editingParticipant, setEditingParticipant] = useState<number | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const standingsRef = useRef<View>(null);

  const { matches, units, participants, refresh: refreshMatches, updateScore } = useMatches(
    tournamentId,
    tournament?.sport ?? 'badminton'
  );
  const { standings, refresh: refreshStandings } = useStandings(
    tournamentId,
    tournament?.sport ?? 'badminton'
  );

  useEffect(() => {
    const t = getTournament(tournamentId);
    if (t) {
      setTournament(t);
      setNameValue(t.name);
    }
  }, [tournamentId]);

  useEffect(() => {
    if (tournament) {
      refreshMatches();
      refreshStandings();
    }
  }, [tournament, refreshMatches, refreshStandings]);

  const getParticipantName = useCallback(
    (id: number) => participants.find((p) => p.id === id)?.name ?? 'Unknown',
    [participants]
  );

  const handleRenameTournament = useCallback(() => {
    if (nameValue.trim() && tournament) {
      updateTournamentName(tournament.id, nameValue.trim());
      setTournament({ ...tournament, name: nameValue.trim() });
    }
    setEditingName(false);
  }, [nameValue, tournament]);

  const handleRenameParticipant = useCallback((pid: number, newName: string) => {
    updateParticipantName(pid, newName);
    refreshMatches();
  }, [refreshMatches]);

  const handleDeleteTournament = useCallback(() => {
    if (!tournament) return;
    Alert.alert(
      'Delete Tournament',
      `Are you sure you want to delete "${tournament.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTournament(tournament.id);
            router.back();
          },
        },
      ]
    );
  }, [tournament, router]);

  const getMatchScorePreview = useCallback(
    (matchId: number) => {
      const matchUnits = units[matchId] || [];
      const filled = matchUnits.filter((u: any) => {
        const a = tournament?.sport === 'badminton' ? u.scoreA : u.gamesA;
        const b = tournament?.sport === 'badminton' ? u.scoreB : u.gamesB;
        return a !== null && b !== null;
      });
      if (filled.length === 0) return null;
      return filled
        .map((u: any) => {
          const a = tournament?.sport === 'badminton' ? u.scoreA : u.gamesA;
          const b = tournament?.sport === 'badminton' ? u.scoreB : u.gamesB;
          return `${a}-${b}`;
        })
        .join('  ·  ');
    },
    [units, tournament?.sport]
  );

  const handleShare = useCallback(async () => {
    if (!standingsRef.current) return;
    try {
      const uri = await captureRef(standingsRef, {
        format: 'png',
        quality: 1,
        result: Platform.OS === 'web' ? 'data-uri' : 'tmpfile',
      });

      if (Platform.OS === 'web') {
        // On web, convert data URI to blob and use Web Share API or download
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = new File([blob], `${tournament?.name ?? 'tournament'}-standings.png`, {
          type: 'image/png',
        });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${tournament?.name ?? 'Tournament'} Standings`,
          });
        } else {
          // Fallback: download the image
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${tournament?.name ?? 'tournament'}-standings.png`;
          link.click();
          URL.revokeObjectURL(link.href);
        }
      } else {
        await Sharing.shareAsync(uri, {
          dialogTitle: `${tournament?.name ?? 'Tournament'} Standings`,
          mimeType: 'image/png',
        });
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  }, [tournament?.name]);

  const renderMatchesTab = () => {
    const upcoming = matches.filter((m) => m.status === 'upcoming');
    const inProgress = matches.filter((m) => m.status === 'in_progress');
    const completed = matches.filter((m) => m.status === 'completed');

    const renderSection = (title: string, matchList: typeof matches) => {
      if (matchList.length === 0) return null;
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {matchList.map((match) => {
            const preview = getMatchScorePreview(match.id);
            return (
              <TouchableOpacity
                key={match.id}
                style={styles.matchRow}
                onPress={() => {
                  setSelectedMatchId(match.id);
                  setScoreModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.matchLeft}>
                  <Text style={styles.matchPlayers}>
                    {getParticipantName(match.participantAId)}
                    <Text style={styles.vs}> vs </Text>
                    {getParticipantName(match.participantBId)}
                  </Text>
                  {preview && <Text style={styles.matchPreview}>{preview}</Text>}
                </View>
                <StatusDot status={match.status} />
              </TouchableOpacity>
            );
          })}
        </View>
      );
    };

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderSection('Live', inProgress)}
        {renderSection('Upcoming', upcoming)}
        {renderSection('Completed', completed)}
      </ScrollView>
    );
  };

  const renderStandingsTab = () => {
    if (standings.length === 0) {
      return (
        <View style={styles.emptyStandings}>
          <Text style={styles.emptyText}>No completed matches yet</Text>
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View ref={standingsRef} style={styles.captureArea}>
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 0.5 }]}>#</Text>
              <Text style={[styles.th, { flex: 2.2 }]}>Player</Text>
              <Text style={[styles.th, { flex: 0.7, textAlign: 'center' }]}>W</Text>
              <Text style={[styles.th, { flex: 0.7, textAlign: 'center' }]}>L</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Diff</Text>
            </View>
            {standings.map((entry) => (
              <View key={entry.participantId} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 0.5, fontFamily: Font.extrabold }]}>
                  {entry.tiedWith.length > 0 ? `T${entry.rank}` : entry.rank}
                </Text>
                <Text style={[styles.td, { flex: 2.2 }]} numberOfLines={1}>
                  {entry.name}
                </Text>
                <Text style={[styles.td, { flex: 0.7, textAlign: 'center' }]}>{entry.wins}</Text>
                <Text style={[styles.td, { flex: 0.7, textAlign: 'center' }]}>{entry.losses}</Text>
                <Text
                  style={[
                    styles.td,
                    { flex: 1, textAlign: 'right' },
                    entry.pointDiff > 0 && { color: Colors.success },
                    entry.pointDiff < 0 && { color: Colors.danger },
                  ]}
                >
                  {entry.pointDiff > 0 ? `+${entry.pointDiff}` : entry.pointDiff}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderSettingsTab = () => {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.settingsCard}>
          <Text style={styles.settingsLabel}>Tournament Name</Text>
          {editingName ? (
            <TextInput
              style={styles.settingsInput}
              value={nameValue}
              onChangeText={setNameValue}
              autoFocus
              onBlur={handleRenameTournament}
              onSubmitEditing={handleRenameTournament}
            />
          ) : (
            <TouchableOpacity onPress={() => setEditingName(true)} activeOpacity={0.7}>
              <Text style={styles.settingsValue}>{tournament?.name}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.settingsLabel}>Sport</Text>
          <Text style={styles.settingsValue}>
            {tournament?.sport === 'badminton' ? '🏸 Badminton' : '🎾 Tennis'}
          </Text>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.settingsLabel}>Players</Text>
          {editingParticipant != null ? (
            <TextInput
              style={styles.settingsInput}
              value={participantName}
              onChangeText={setParticipantName}
              autoFocus
              onBlur={() => {
                if (editingParticipant != null) {
                  handleRenameParticipant(editingParticipant, participantName);
                  setEditingParticipant(null);
                }
              }}
              onSubmitEditing={() => {
                if (editingParticipant != null) {
                  handleRenameParticipant(editingParticipant, participantName);
                  setEditingParticipant(null);
                }
              }}
            />
          ) : (
            <View>
              {participants.map((p, index) => (
                <View key={p.id}>
                  <TouchableOpacity
                    style={styles.settingsPlayerRow}
                    onPress={() => {
                      setEditingParticipant(p.id);
                      setParticipantName(p.name);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.settingsPlayerText}>{p.name}</Text>
                    <Text style={styles.settingsPlayerHint}>Edit</Text>
                  </TouchableOpacity>
                  {index < participants.length - 1 && <View style={styles.settingsDivider} />}
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteTournament} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>Delete Tournament</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  if (!tournament) {
    return (
      <View style={styles.root}>
        <Text style={{ color: Colors.textMuted }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {tournament.name}
        </Text>
        {activeTab === 'standings' && standings.length > 0 ? (
          <TouchableOpacity onPress={handleShare} activeOpacity={0.7} style={styles.headerAction}>
            <Text style={styles.headerActionText}>📤</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <View style={styles.tabBar}>
        {(['matches', 'standings', 'settings'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'matches' && renderMatchesTab()}
        {activeTab === 'standings' && renderStandingsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </View>

      {scoreModalVisible && selectedMatchId != null && (() => {
        const match = matches.find((m) => m.id === selectedMatchId);
        if (!match) return null;
        const pA = participants.find((p) => p.id === match.participantAId)?.name ?? 'Player A';
        const pB = participants.find((p) => p.id === match.participantBId)?.name ?? 'Player B';
        const matchUnits = units[selectedMatchId] || [];
        const modalUnits = matchUnits.map((u: any) => ({
          unitNumber: u.gameNumber ?? u.setNumber,
          scoreA: tournament?.sport === 'badminton' ? u.scoreA : u.gamesA,
          scoreB: tournament?.sport === 'badminton' ? u.scoreB : u.gamesB,
        }));
        return (
          <ScoreEntryModal
            playerA={pA}
            playerB={pB}
            unitLabel={tournament?.sport === 'badminton' ? 'Game' : 'Set'}
            units={modalUnits}
            onSave={(unitNumber, scoreA, scoreB) => {
              updateScore(selectedMatchId, unitNumber, scoreA, scoreB);
              refreshMatches();
              refreshStandings();
            }}
            onClose={() => {
              setScoreModalVisible(false);
              setSelectedMatchId(null);
            }}
          />
        );
      })()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backText: {
    fontFamily: Font.semibold,
    fontSize: 15,
    color: Colors.primary,
    width: 60,
  },
  headerTitle: {
    fontFamily: Font.bold,
    fontSize: 17,
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabText: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.text,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 24,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Font.semibold,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  matchLeft: {
    flex: 1,
    marginRight: 12,
  },
  matchPlayers: {
    fontFamily: Font.semibold,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 2,
  },
  vs: {
    fontFamily: Font.medium,
    fontSize: 13,
    color: Colors.textMuted,
  },
  matchPreview: {
    fontFamily: Font.medium,
    fontSize: 13,
    color: Colors.textMuted,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emptyStandings: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: Font.medium,
    fontSize: 15,
    color: Colors.textMuted,
  },
  headerAction: {
    width: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerActionText: {
    fontSize: 20,
  },
  captureArea: {
    backgroundColor: Colors.bg,
    padding: 4,
    borderRadius: Radius.sm,
  },
  tableCard: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  th: {
    fontFamily: Font.semibold,
    fontSize: 12,
    color: Colors.textMuted,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    alignItems: 'center',
  },
  td: {
    fontFamily: Font.medium,
    fontSize: 14,
    color: Colors.text,
  },
  settingsCard: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  settingsLabel: {
    fontFamily: Font.semibold,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  settingsValue: {
    fontFamily: Font.regular,
    fontSize: 16,
    color: Colors.text,
  },
  settingsInput: {
    fontFamily: Font.regular,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingsPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingsPlayerText: {
    fontFamily: Font.regular,
    fontSize: 16,
    color: Colors.text,
  },
  settingsPlayerHint: {
    fontFamily: Font.medium,
    fontSize: 13,
    color: Colors.textMuted,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  deleteBtn: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
  },
  deleteBtnText: {
    fontFamily: Font.semibold,
    fontSize: 15,
    color: Colors.danger,
  },
});
