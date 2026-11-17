import type { MatchStatus, PoolStage, TournamentType } from '@/types';

export interface NextStepAction {
  label: string;
  onPress: () => void;
  confirm?: { title: string; message: string };
}

export interface NextStep {
  title: string;
  winner?: { participantId: number; name: string };
  progress?: { done: number; total: number };
  pairs?: [string, string][] | null;
  primary?: NextStepAction;
  secondary?: NextStepAction;
}

interface MatchLike {
  poolId?: number | null;
  status: MatchStatus;
  winnerId: number | null;
  feedsIntoMatchId?: number | null;
}

interface NextStepInput {
  tournamentType: TournamentType;
  stage: PoolStage | null | undefined;
  matches: MatchLike[];
  drawPairs: [string, string][] | null;
  canShuffleDraw?: boolean;
  getName: (id: number) => string;
  onDraw: () => void;
  onLock: () => void;
}

function progressOf(list: MatchLike[]): NextStep['progress'] {
  const done = list.filter((m) => m.status === 'completed').length;
  return { done, total: list.length };
}

function remainingLabel(list: MatchLike[]): string {
  const left = list.filter((match) => match.status !== 'completed').length;
  return `${left} match${left === 1 ? '' : 'es'} left`;
}

export function nextStepFor({
  tournamentType,
  stage,
  matches,
  drawPairs,
  canShuffleDraw = true,
  getName,
  onDraw,
  onLock,
}: NextStepInput): NextStep {
  const groupMatches = matches.filter((m) => m.poolId != null);
  const knockoutMatches = matches.filter((m) => m.poolId == null);

  if (matches.length === 0) {
    return {
      title: 'No matches yet',
    };
  }

  if (tournamentType === 'knockout' || stage === 'knockout') {
    const final = knockoutMatches.find((m) => m.feedsIntoMatchId == null);
    if (final?.status === 'completed' && final.winnerId !== null) {
      return {
        title: `Winner: ${getName(final.winnerId)}`,
        winner: { participantId: final.winnerId, name: getName(final.winnerId) },
        progress: progressOf(knockoutMatches),
      };
    }
    return {
      title: remainingLabel(knockoutMatches),
      progress: progressOf(knockoutMatches),
    };
  }

  if (stage === 'pools') {
    if (groupMatches.some((m) => m.status !== 'completed')) {
      return {
        title: remainingLabel(groupMatches),
        progress: progressOf(groupMatches),
      };
    }
    if (drawPairs) {
      return {
        title: 'Knockout draw',
        pairs: drawPairs,
        primary: {
          label: 'Start knockout',
          onPress: onLock,
          confirm: {
            title: 'Start knockout?',
            message: 'Group results will be locked.',
          },
        },
        secondary: canShuffleDraw ? { label: 'Shuffle', onPress: onDraw } : undefined,
      };
    }
    return {
      title: 'Groups complete',
      progress: progressOf(groupMatches),
      primary: { label: 'Review knockout', onPress: onDraw },
    };
  }

  if (matches.every((m) => m.status === 'completed')) {
    return {
      title: 'Finished',
      progress: progressOf(matches),
    };
  }
  return {
    title: remainingLabel(matches),
    progress: progressOf(matches),
  };
}
