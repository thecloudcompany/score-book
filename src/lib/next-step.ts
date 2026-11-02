import type { MatchStatus, PoolStage, TournamentType } from '@/types';

export interface NextStepAction {
  label: string;
  onPress: () => void;
  confirm?: { title: string; message: string };
}

export interface NextStep {
  title: string;
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
  getName: (id: number) => string;
  onDraw: () => void;
  onLock: () => void;
}

function progressOf(list: MatchLike[]): NextStep['progress'] {
  const done = list.filter((m) => m.status === 'completed').length;
  return { done, total: list.length };
}

export function nextStepFor({
  tournamentType,
  stage,
  matches,
  drawPairs,
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
        progress: progressOf(knockoutMatches),
      };
    }
    return {
      title: 'Knockout in progress',
      progress: progressOf(knockoutMatches),
    };
  }

  if (stage === 'pools') {
    if (groupMatches.some((m) => m.status !== 'completed')) {
      return {
        title: 'Play the group matches',
        progress: progressOf(groupMatches),
      };
    }
    if (drawPairs) {
      return {
        title: 'Check the knockout draw',
        pairs: drawPairs,
        primary: {
          label: 'Confirm draw',
          onPress: onLock,
          confirm: {
            title: 'Confirm the knockout draw?',
            message: 'The group results will be locked. This cannot be undone.',
          },
        },
        secondary: { label: 'Shuffle again', onPress: onDraw },
      };
    }
    return {
      title: 'Groups are finished',
      progress: progressOf(groupMatches),
      primary: { label: 'Make the knockout', onPress: onDraw },
    };
  }

  if (matches.every((m) => m.status === 'completed')) {
    return {
      title: 'All matches are finished',
      progress: progressOf(matches),
    };
  }
  return {
    title: 'Play the matches',
    progress: progressOf(matches),
  };
}
