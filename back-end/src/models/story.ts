import { getSuggestion } from './suggestion';
import { Category, Game, GamePhase, StoryEntry } from '../.generated/prisma';
import SaveEntryError from '../errors/SaveEntryError';
import prisma from '../prisma';
import { GameDto, StoryResBody, UserDto } from '../types/domain.js';
import { WAIT, punctRegex, quoteRegex } from '../utils/constants.js';
import { lowerFirst, randomNumber, upperFirst } from '../utils/utils.js';

const fillers = ['', '(Man) ', '(Man) and (Woman) ', '', '', ''];
const prefixes = ['', 'and ', 'were ', 'He said, "', 'She said, "', 'So they '];
const suffixes = [' ', ' ', ' ', '" ', '" ', ' '];
const prompts = [
  "Man's name:",
  "Woman's name:",
  'Activity:',
  'Statement:',
  'Statement:',
  'Activity:'
];
const categories = [
  Category.MALE_NAME,
  Category.FEMALE_NAME,
  Category.PRESENT_ACTION,
  Category.STATEMENT,
  Category.STATEMENT,
  Category.PAST_ACTION
];

export function getRoundNumber(entries: { values?: string[] }[]): number {
  if (!entries.length) return 0;
  const lengths = entries.map((e) => e.values?.length ?? 0);
  return Math.min(...lengths);
}

export function isBehind(round: number, entry: { values?: string[] } | null) {
  if (!entry?.values) return true;
  return entry.values.length <= round;
}

/**
 * Check if all players have submitted an entry for the current round.
 * Once all rounds are complete, marks the game as complete.
 *
 * @param {Game} game
 * @return {Promise<{ round: number; waitingOnUsers: string[] }>}
 */
export async function checkRoundCompletion(
  game: Game
): Promise<{ round: number; waitingOnUsers: string[] }> {
  if (game.phase !== GamePhase.PLAY) return { round: 0, waitingOnUsers: [] };

  const users = await prisma.user.findMany({
    where: { gameId: game.id },
    include: {
      storyEntries: {
        where: { gameId: game.id }
      }
    }
  });
  const entries = users.map((u) => ({
    ...u.storyEntries.at(0),
    nickname: u.nickname
  }));

  const round = getRoundNumber(entries);
  const waitingOnUsers = entries
    .filter((e) => isBehind(round, e))
    .map((e) => e.nickname);

  if (waitingOnUsers.length > 0 && round < fillers.length) {
    return { round, waitingOnUsers };
  }

  if (round >= fillers.length) {
    game.phase = GamePhase.READ;
    await prisma.game.update({
      where: { id: game.id },
      data: { phase: GamePhase.READ }
    });

    const finalEntries = getFinalEntries(entries as StoryEntry[]);
    await prisma.$transaction(
      finalEntries.map((e) =>
        prisma.storyEntry.update({
          where: { id: e.id },
          data: { finalValue: e.finalValue }
        })
      )
    );
  }

  return { round, waitingOnUsers };
}

function getFinalEntries(entries: StoryEntry[]): StoryEntry[] {
  const salt = randomNumber(entries.length);
  for (let i = 0; i < entries.length; i++) {
    const s = [];
    for (let j = 0; j < prefixes.length; j++) {
      s.push(prefixes[j]);
      s.push(entries[(i + j + salt) % entries.length].values[j]);
      s.push(suffixes[j]);
    }

    entries[i].finalValue = s.join('');
  }
  return entries;
}

export function processValue(part: string, round: number) {
  let value = part.replace(quoteRegex, '').trim();
  if (round > 1 && !punctRegex.test(value)) value += '.';
  if (round === 2 || round === 5) {
    value = lowerFirst(value);
  } else {
    value = upperFirst(value);
  }
  return value;
}

export const getStoryStatus = async (
  user: UserDto,
  game: GameDto
): Promise<StoryResBody> => {
  const { round, waitingOnUsers } = await checkRoundCompletion(game);
  const entry = await prisma.storyEntry.findUnique({
    where: {
      gameId_userId: {
        gameId: game.id,
        userId: user.id
      }
    }
  });
  if (game.phase === GamePhase.PLAY) {
    const category = categories[round];
    const suggestion = await getSuggestion(category);
    return {
      phase: isBehind(round, entry) ? GamePhase.PLAY : WAIT,
      round: round,
      filler: fillers[round],
      prompt: prompts[round],
      prefix: prefixes[round],
      suffix: suffixes[round],
      placeholder: suggestion,
      users: waitingOnUsers
    };
  } else {
    return {
      phase: GamePhase.READ,
      story: entry?.finalValue,
      id: game.uuid,
      isHost: game.hostId === user.id
    };
  }
};

export const saveStoryEntry = async (
  user: UserDto,
  game: GameDto,
  part: string
) => {
  if (game.phase !== GamePhase.PLAY) {
    throw new SaveEntryError('Game is not in "PLAY" phase');
  }
  if (!part) {
    throw new SaveEntryError('No value was entered');
  }

  const { round } = await checkRoundCompletion(game);
  const value = processValue(part, round);
  const entry = await prisma.storyEntry.findUnique({
    where: {
      gameId_userId: {
        gameId: game.id,
        userId: user.id
      }
    }
  });

  if (!entry) {
    await prisma.storyEntry.create({
      data: {
        user: { connect: { id: user.id } },
        game: { connect: { id: game.id } },
        values: [value],
        finalValue: ''
      }
    });
  } else if (entry.values.length <= round) {
    await prisma.storyEntry.update({
      where: { id: entry.id },
      data: {
        values: [...entry.values, value]
      }
    });
  } else {
    throw new SaveEntryError('User has already submitted this round');
  }
};

export const getStoryArchive = async (gameUuid: string) => {
  const entries = await prisma.storyEntry.findMany({
    where: {
      game: { uuid: gameUuid }
    },
    include: { user: true }
  });

  return entries;
};
