import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import ScoreEntryModal from '@/components/score-entry-modal';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { MatchesTab } from '@/components/matches-tab';
import { StandingsTab } from '@/components/standings-tab';
import { SettingsTab } from '@/components/settings-tab';
import {
  getTournament,
  getParticipants,
  updateParticipantName,
  updateTournamentName,
  deleteTournament,
} from '@/lib/db-operations';
import { useMatches } from '@/hooks/use-matches';
import { useStandings } from '@/hooks/use-standings';
import { Colors } from '@/constants/theme';
import { badmintonSport } from '@/lib/sports/badminton';
import { tennisSport } from '@/lib/sports/tennis';
import { s } from './[id].styles';
import type { Tournament, Sport, MatchFormat } from '@/types';

type TabType = 'matches' | 'standings' | 'settings';

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const tournamentId = Number(id);
  const initialTournament = getTournament(tournamentId);

  const [tournament, setTournament] = useState<Tournament | null>(initialTournament);
  const [activeTab, setActiveTab] = useState<TabType>('matches');
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [fullParticipants, setFullParticipants] = useState(getParticipants(tournamentId));
  const standingsRef = useRef<View | null>(null);

  const { matches, units, participants, refresh: refreshMatches, updateScore } = useMatches(
    tournamentId,
    tournament?.sport ?? 'badminton',
    tournament?.type ?? 'round_robin'
  );
  const { standings, refresh: refreshStandings } = useStandings(
    tournamentId,
    tournament?.sport ?? 'badminton'
  );

  useEffect(() => {
    if (tournament) {
      refreshMatches();
      refreshStandings();
      setFullParticipants(getParticipants(tournamentId));
    }
  }, [tournament, refreshMatches, refreshStandings]);

  const getParticipantName = useCallback(
    (pid: number) => participants.find((p) => p.id === pid)?.name ?? 'Unknown',
    [participants]
  );

  const handleMatchPress = useCallback((matchId: number) => {
    setSelectedMatchId(matchId);
    setScoreModalVisible(true);
  }, []);

  const closeScoreModal = useCallback(() => {
    setScoreModalVisible(false);
    setSelectedMatchId(null);
  }, []);

  const handleRenameTournament = useCallback(
    (newName: string) => {
      if (tournament) setTournament({ ...tournament, name: newName });
    },
    [tournament]
  );

  const handleRenameParticipant = useCallback(
    (pid: number, newName: string) => {
      updateParticipantName(pid, newName);
      refreshMatches();
    },
    [refreshMatches]
  );

  const handleDeleteTournament = useCallback(() => setDeleteDialogVisible(true), []);

  const confirmDeleteTournament = useCallback(() => {
    if (!tournament) return;
    setDeleteDialogVisible(false);
    deleteTournament(tournament.id);
    router.back();
  }, [tournament, router, deleteTournament]);

  const tournamentName = tournament?.name ?? 'tournament';

  const handleShare = useCallback(async () => {
    if (!standingsRef.current) return;
    try {
      const uri = await captureRef(standingsRef, {
        format: 'png',
        quality: 1,
        result: Platform.OS === 'web' ? 'data-uri' : 'tmpfile',
      });

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = new File([blob], `${tournamentName}-standings.png`, {
          type: 'image/png',
        });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `${tournamentName} Standings` });
        } else {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${tournamentName}-standings.png`;
          link.click();
          URL.revokeObjectURL(link.href);
        }
      } else {
        await Sharing.shareAsync(uri, {
          dialogTitle: `${tournamentName} Standings`,
          mimeType: 'image/png',
        });
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  }, [tournamentName]);

  if (!tournament) {
    return (
      <View style={s.root}>
        <Text style={{ color: Colors.textMuted }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>
          {tournament.name}
        </Text>
        {activeTab === 'standings' && standings.length > 0 ? (
          <TouchableOpacity onPress={handleShare} activeOpacity={0.7} style={s.headerAction}>
            <Text style={s.headerActionText}>📤</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <View style={s.tabBar}>
        {(['matches', 'standings', 'settings'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={s.tab}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            {activeTab === tab && <View style={s.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.content}>
        {activeTab === 'matches' && (
          <MatchesTab
            tournamentType={tournament.type ?? 'round_robin'}
            matches={matches}
            units={units}
            sport={tournament.sport ?? 'badminton'}
            getParticipantName={getParticipantName}
            onMatchPress={handleMatchPress}
          />
        )}
        {activeTab === 'standings' && (
          <StandingsTab
            tournamentType={tournament.type ?? 'round_robin'}
            participants={fullParticipants}
            matches={matches}
            standings={standings}
            captureRef={standingsRef}
            getParticipantName={getParticipantName}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            tournament={tournament}
            participants={fullParticipants}
            onRenameTournament={(name) => {
              updateTournamentName(tournament.id, name);
              handleRenameTournament(name);
            }}
            onRenameParticipant={handleRenameParticipant}
            onDeletePress={handleDeleteTournament}
          />
        )}
      </View>

      {scoreModalVisible && selectedMatchId != null && (() => {
        const match = matches.find((m) => m.id === selectedMatchId);
        if (!match) return null;
        const pA = getParticipantName(match.participantAId);
        const pB = match.participantBId !== null ? getParticipantName(match.participantBId) : 'Player B';
        const matchUnits = units[selectedMatchId] || [];
        const modalUnits = matchUnits.map((u: any) => ({
          unitNumber: u.gameNumber ?? u.setNumber,
          scoreA: tournament.sport === 'badminton' ? u.scoreA : u.gamesA,
          scoreB: tournament.sport === 'badminton' ? u.scoreB : u.gamesB,
        }));
        const sport: Sport = tournament.sport === 'badminton' ? badmintonSport : tennisSport;
        const format: MatchFormat = 'gamePoint' in match
          ? { gamePoint: match.gamePoint, bestOfGames: match.bestOfGames }
          : { setsToWin: match.setsToWin, gamesToWinPerSet: match.gamesToWinPerSet };
        return (
          <ScoreEntryModal
            playerA={pA}
            playerB={pB}
            unitLabel={tournament.sport === 'badminton' ? 'Game' : 'Set'}
            units={modalUnits}
            sport={sport}
            format={format}
            onSave={(unitNumber, scoreA, scoreB) => {
              updateScore(selectedMatchId, unitNumber, scoreA, scoreB);
              refreshMatches();
              refreshStandings();
            }}
            onClose={closeScoreModal}
          />
        );
      })()}

      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete Tournament"
        message={`Are you sure you want to delete "${tournament.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onConfirm={confirmDeleteTournament}
        onCancel={() => setDeleteDialogVisible(false)}
      />
    </SafeAreaView>
  );
}
