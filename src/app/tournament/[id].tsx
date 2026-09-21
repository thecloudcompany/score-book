import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { useIsWideLayout } from '@/hooks/use-layout';
import { ContentContainer } from '@/components/content-container';
import { badmintonSport } from '@/lib/sports/badminton';
import { tennisSport } from '@/lib/sports/tennis';
import { tableTennisSport } from '@/lib/sports/table-tennis';
import { pickleballSport } from '@/lib/sports/pickleball';
import { s } from '@/components/tournament-detail.styles';
import type { Tournament, Sport, MatchFormat } from '@/types';

type TabType = 'matches' | 'standings' | 'settings';

const TAB_META: Record<TabType, { emoji: string; label: string }> = {
  matches: { emoji: '📋', label: 'Matches' },
  standings: { emoji: '🏆', label: 'Standings' },
  settings: { emoji: '⚙', label: 'Settings' },
};

const MATCH_CONTENT_MAX_WIDTH = 760;

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
  const [participantsVersion, setParticipantsVersion] = useState(0);
  const [shareError, setShareError] = useState('');
  const standingsRef = useRef<View | null>(null);
  const isWide = useIsWideLayout();

  const { matches, units, participants, refresh: refreshMatches, updateScore } = useMatches(
    tournamentId,
    tournament?.sport ?? 'badminton',
    tournament?.type ?? 'round_robin'
  );
  const { standings, refresh: refreshStandings } = useStandings(
    tournamentId,
    tournament?.sport ?? 'badminton'
  );

  const fullParticipants = useMemo(
    () => getParticipants(tournamentId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tournamentId, participantsVersion]
  );

  useEffect(() => {
    if (tournament) {
      refreshMatches();
      refreshStandings();
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
      refreshStandings();
      setParticipantsVersion((v) => v + 1);
    },
    [refreshMatches, refreshStandings]
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
    setShareError('');
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
      setShareError('Could not share standings. Try again.');
    }
  }, [tournamentName]);

  const renderActiveTab = () => {
    if (activeTab === 'matches') {
      return (
        <MatchesTab
          tournamentType={tournament!.type ?? 'round_robin'}
          matches={matches}
          units={units}
          sport={tournament!.sport ?? 'badminton'}
          getParticipantName={getParticipantName}
          onMatchPress={handleMatchPress}
        />
      );
    }
    if (activeTab === 'standings') {
      return (
        <StandingsTab
          tournamentType={tournament!.type ?? 'round_robin'}
          tournamentName={tournament!.name}
          participants={fullParticipants}
          matches={matches}
          standings={standings}
          captureRef={standingsRef}
          getParticipantName={getParticipantName}
        />
      );
    }
    return (
      <SettingsTab
        tournament={tournament!}
        participants={fullParticipants}
        onRenameTournament={(name) => {
          updateTournamentName(tournament!.id, name);
          handleRenameTournament(name);
        }}
        onRenameParticipant={handleRenameParticipant}
        onDeletePress={handleDeleteTournament}
      />
    );
  };

  if (!tournament) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.centered}>
          <Text style={s.notFoundTitle}>Tournament not found</Text>
          <Text style={s.notFoundHint}>It may have been deleted in another tab.</Text>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={s.backBtn}>
            <Text style={s.backBtnText}>← Back to tournaments</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
          <TouchableOpacity onPress={handleShare} activeOpacity={0.7} style={s.headerAction} accessibilityLabel="Share standings" accessibilityRole="button">
            <Text style={s.headerActionText}>📤</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>
      {shareError !== '' && <Text style={s.shareError}>{shareError}</Text>}

      {isWide ? (
        <View style={s.wideRow}>
          <View style={s.sideRail}>
            {(['matches', 'standings', 'settings'] as TabType[]).map((tab) => {
              const meta = TAB_META[tab];
              return (
                <TouchableOpacity
                  key={tab}
                  style={s.railItem}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.7}
                >
                  {activeTab === tab && <View style={s.railIndicator} />}
                  <Text style={s.railEmoji}>{meta.emoji}</Text>
                  <Text style={[s.railLabel, activeTab === tab && s.railLabelActive]}>
                    {meta.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ContentContainer maxWidth={MATCH_CONTENT_MAX_WIDTH} style={s.contentWide}>
            {renderActiveTab()}
          </ContentContainer>
        </View>
      ) : (
        <>
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
            <ContentContainer>
              {renderActiveTab()}
            </ContentContainer>
          </View>
        </>
      )}

      {scoreModalVisible && selectedMatchId != null && (() => {
        const match = matches.find((m) => m.id === selectedMatchId);
        if (!match) return null;
        const pA = match.participantAId != null ? getParticipantName(match.participantAId) : 'TBD';
        const pB = match.participantBId !== null ? getParticipantName(match.participantBId) : 'Player B';
        const matchUnits = units[selectedMatchId] || [];
        const isScoreSport = tournament.sport !== 'tennis';
        const modalUnits = matchUnits.map((u: any) => ({
          unitNumber: u.gameNumber ?? u.setNumber,
          scoreA: isScoreSport ? u.scoreA : u.gamesA,
          scoreB: isScoreSport ? u.scoreB : u.gamesB,
        }));
        const sport: Sport = tournament.sport === 'badminton'
          ? badmintonSport
          : tournament.sport === 'table_tennis'
            ? tableTennisSport
            : tournament.sport === 'pickleball'
              ? pickleballSport
              : tennisSport;
        const format: MatchFormat = 'gamePoint' in match
          ? { gamePoint: match.gamePoint, bestOfGames: match.bestOfGames }
          : { setsToWin: match.setsToWin, gamesToWinPerSet: match.gamesToWinPerSet };
        return (
          <ScoreEntryModal
            playerA={pA}
            playerB={pB}
            unitLabel={tournament.sport === 'tennis' ? 'Set' : 'Game'}
            units={modalUnits}
            sport={sport}
            format={format}
            onSave={(unitNumber, scoreA, scoreB) => {
              updateScore(selectedMatchId, unitNumber, scoreA, scoreB);
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
