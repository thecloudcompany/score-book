import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { StandingsCaptureRef } from '@/components/standings-capture';
import * as Sharing from 'expo-sharing';
import ScoreEntryModal from '@/components/score-entry-modal';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { MatchesTab } from '@/components/matches-tab';
import { StandingsTab } from '@/components/standings-tab';
import { SettingsTab, type PoolSettingsActions } from '@/components/settings-tab';
import { NextStepCard } from '@/components/next-step-card';
import { nextStepFor } from '@/lib/next-step';
import {
  getTournament,
  getParticipants,
  updateParticipantName,
  updateTournamentName,
  deleteTournament,
  getTournamentMaxScore,
  hasTournamentScores,
  updateTournamentMaxScore,
} from '@/lib/db-operations';
import {
  addLateParticipant,
  lateAdditionsOpen,
  lockKnockout,
  previewKnockout,
  updatePoolAdvancement,
} from '@/lib/pool-operations';
import { randomSeed } from '@/lib/rng';
import { useMatches } from '@/hooks/use-matches';
import { useStandings } from '@/hooks/use-standings';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { Swords, ListOrdered } from 'lucide-react-native';
import { ContentContainer } from '@/components/content-container';
import { TournamentHeader } from '@/components/tournament-header';
import { badmintonSport } from '@/lib/sports/badminton';
import { tennisSport } from '@/lib/sports/tennis';
import { tableTennisSport } from '@/lib/sports/table-tennis';
import { pickleballSport } from '@/lib/sports/pickleball';
import { s } from '@/components/tournament-detail.styles';
import type { Tournament, Sport, MatchFormat } from '@/types';

type TabType = 'matches' | 'standings';

const TABS = [
  { key: 'matches' as TabType, label: 'Matches', Icon: Swords },
  { key: 'standings' as TabType, label: 'Standings', Icon: ListOrdered },
];

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const tournamentId = Number(id);
  const initialTournament = getTournament(tournamentId);

  const [tournament, setTournament] = useState<Tournament | null>(initialTournament);
  const [activeTab, setActiveTab] = useState<TabType>('matches');
  const [managing, setManaging] = useState(false);
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [participantsVersion, setParticipantsVersion] = useState(0);
  const [settingsVersion, setSettingsVersion] = useState(0);
  const [shareError, setShareError] = useState('');
  const [sharing, setSharing] = useState(false);
  const sharingRef = useRef(false);
  const standingsRef = useRef<StandingsCaptureRef | null>(null);

  const [drawPreview, setDrawPreview] = useState<{ seed: number; order: number[]; canShuffle: boolean; signature: string } | null>(null);
  const [actionError, setActionError] = useState('');

  const { matches, units, participants, refresh: refreshMatches, updateScore } = useMatches(
    tournamentId,
    tournament?.sport ?? 'badminton',
    tournament?.stage ?? null
  );
  const { standings, poolViews, qualifiers, refresh: refreshStandings } = useStandings(
    tournamentId,
    tournament?.sport ?? 'badminton'
  );

  const maxScore = useMemo(
    () => (tournament ? getTournamentMaxScore(tournamentId, tournament.sport) : 21),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tournamentId, tournament?.sport, settingsVersion, matches]
  );

  const hasScores = useMemo(
    () => (tournament ? hasTournamentScores(tournamentId, tournament.sport) : false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tournamentId, tournament?.sport, settingsVersion, units]
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

  const refreshAll = useCallback(() => {
    setTournament(getTournament(tournamentId));
    setParticipantsVersion((v) => v + 1);
    refreshMatches();
    refreshStandings();
  }, [tournamentId, refreshMatches, refreshStandings]);

  const poolMatches = matches.filter((m) => m.poolId != null);
  // A draw is only valid for the pool results it was made from.
  const knockoutSettings = [tournament?.startingSlots, tournament?.qualifiersPerPool, tournament?.wildcardMetric].join('/');
  const poolSignature = knockoutSettings + '#' + poolMatches
    .map((m) => {
      const scores = (units[m.id] ?? []).map((u: any) => `${u.scoreA}-${u.scoreB}`).join('|');
      return `${m.id}:${m.winnerId ?? ''}:${scores}`;
    })
    .join(',');
  const drawActive = drawPreview !== null && drawPreview.signature === poolSignature ? drawPreview : null;
  const drawPairs = drawActive
    ? Array.from({ length: drawActive.order.length / 2 }, (_, i) => [
        getParticipantName(drawActive.order[2 * i]),
        getParticipantName(drawActive.order[2 * i + 1]),
      ] as [string, string])
    : null;

  const drawKnockoutPreview = useCallback(
    (seed: number) => {
      try {
        const preview = previewKnockout(tournamentId, seed);
        setDrawPreview({ seed, order: preview.order, canShuffle: preview.canShuffle, signature: poolSignature });
        setActionError('');
      } catch (e) {
        setActionError(e instanceof Error ? e.message : 'Could not draw the knockout');
      }
    },
    [tournamentId, poolSignature]
  );

  const handleLockKnockout = useCallback(() => {
    if (!drawActive) return;
    try {
      lockKnockout(tournamentId, drawActive.seed);
      setDrawPreview(null);
      setActionError('');
      refreshAll();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not lock the bracket');
    }
  }, [tournamentId, drawActive, refreshAll]);

  const handleAddLatePlayer = useCallback(
    (name: string): string | null => {
      try {
        addLateParticipant(tournamentId, name);
        refreshAll();
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : 'Could not add player';
      }
    },
    [tournamentId, refreshAll]
  );

  const handleUpdateAdvancement = useCallback(
    (patch: Parameters<typeof updatePoolAdvancement>[1]): string | null => {
      try {
        updatePoolAdvancement(tournamentId, patch);
        refreshAll();
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : 'Could not update pools';
      }
    },
    [tournamentId, refreshAll]
  );

  const poolSettingsActions: PoolSettingsActions | null =
    tournament && tournament.poolCount != null
      ? { onUpdateAdvancement: handleUpdateAdvancement }
      : null;

  const canAddPlayers =
    !!tournament &&
    tournament.type === 'round_robin' &&
    tournament.sport === 'badminton' &&
    lateAdditionsOpen(tournament);

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

  const handleUpdateMaxScore = useCallback(
    (newMaxScore: number, resetScores: boolean) => {
      if (!tournament) return;
      updateTournamentMaxScore(
        tournament.id,
        tournament.sport,
        tournament.type,
        newMaxScore,
        resetScores
      );
      refreshMatches();
      refreshStandings();
      setTournament(getTournament(tournament.id));
      setSettingsVersion((v) => v + 1);
    },
    [tournament, refreshMatches, refreshStandings]
  );

  const handleDeleteTournament = useCallback(() => setDeleteDialogVisible(true), []);

  const confirmDeleteTournament = useCallback(() => {
    if (!tournament) return;
    setDeleteDialogVisible(false);
    deleteTournament(tournament.id);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [tournament, router]);

  const tournamentName = tournament?.name ?? 'tournament';

  const handleShare = useCallback(async () => {
    const target = standingsRef.current;
    if (!target || sharingRef.current) return;
    sharingRef.current = true;
    setSharing(true);
    setShareError('');
    try {
      if (Platform.OS !== 'web' && !(await Sharing.isAvailableAsync())) {
        setShareError('Sharing is unavailable in this app build.');
        return;
      }
      const uri = await target.capture();

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
        await Sharing.shareAsync(uri.startsWith('file://') ? uri : `file://${uri}`, {
          dialogTitle: `${tournamentName} Standings`,
          mimeType: 'image/png',
        });
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Share failed:', err);
      setShareError('Could not share standings. Try again.');
    } finally {
      sharingRef.current = false;
      setSharing(false);
    }
  }, [tournamentName]);

  const nextStep = tournament
    ? nextStepFor({
        tournamentType: tournament.type ?? 'round_robin',
        stage: tournament.stage,
        matches,
        drawPairs,
        canShuffleDraw: drawActive?.canShuffle ?? false,
        getName: getParticipantName,
        onDraw: () => drawKnockoutPreview(randomSeed()),
        onLock: handleLockKnockout,
      })
    : null;

  const renderActiveTab = () => {
    if (!managing && activeTab === 'matches') {
      return (
        <MatchesTab
          tournamentType={tournament!.type ?? 'round_robin'}
          matches={matches}
          units={units}
          sport={tournament!.sport ?? 'badminton'}
          pools={poolViews.map((view) => view.pool)}
          poolsLocked={tournament!.stage === 'knockout'}
          getParticipantName={getParticipantName}
          onMatchPress={handleMatchPress}
        />
      );
    }
    if (!managing && activeTab === 'standings') {
      return (
        <StandingsTab
          tournamentType={tournament!.type ?? 'round_robin'}
          tournamentName={tournament!.name}
          participants={fullParticipants}
          matches={matches}
          standings={standings}
          poolViews={poolViews}
          qualifiers={qualifiers}
          captureRef={standingsRef}
          getParticipantName={getParticipantName}
        />
      );
    }
    return (
      <SettingsTab
        tournament={tournament!}
        participants={fullParticipants}
        maxScore={maxScore}
        hasScores={hasScores}
        poolSettings={poolSettingsActions}
        canAddPlayers={canAddPlayers}
        pools={poolViews.map((view) => view.pool)}
        onRenameTournament={(name) => {
          updateTournamentName(tournament!.id, name);
          handleRenameTournament(name);
        }}
        onRenameParticipant={handleRenameParticipant}
        onUpdateMaxScore={handleUpdateMaxScore}
        onAddLatePlayer={handleAddLatePlayer}
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
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/')} activeOpacity={0.7} style={s.backBtn}>
            <Text style={s.backBtnText}>← Back to tournaments</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root} edges={['top', 'left', 'right', 'bottom']}>
      <TournamentHeader
        tournament={tournament}
        managing={managing}
        onBack={() => router.replace('/')}
        onManage={() => setManaging((open) => !open)}
        onShare={!managing && activeTab === 'standings' && (standings.length > 0 || poolViews.length > 0) ? handleShare : undefined}
        sharing={sharing}
      />
      {(shareError || actionError) !== '' && <Text style={s.shareError}>{shareError || actionError}</Text>}

      {!managing && nextStep && (nextStep.primary || (activeTab === 'matches' && nextStep.winner)) && (
        <View style={s.nextStepWrap}>
          <ContentContainer>
            <NextStepCard {...nextStep} />
          </ContentContainer>
        </View>
      )}

      {!managing && <View style={s.segmentWrap}>
        <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </View>}

      <View style={s.content}>
        <ContentContainer style={s.fill}>
          {renderActiveTab()}
        </ContentContainer>
      </View>

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
