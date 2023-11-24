import { getSuggestion } from './suggestion';
import { Category, Game, GamePhase, StoryEntry } from '../.generated/prisma';
import SaveEntryError from '../errors/SaveEntryError';
import prisma from '../prisma';
import { GameDto, PlayerDto, StoryResBody } from '../types/domain.js';
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
 * @return {Promise<{ round: number; waitingOnPlayers: string[] }>}
 */
export async function checkRoundCompletion(
  game: Game
): Promise<{ round: number; waitingOnPlayers: string[] }> {
  if (game.phase !== GamePhase.PLAY) return { round: 0, waitingOnPlayers: [] };

  const players = await prisma.player.findMany({
    where: { gameId: game.id },
    include: {
      storyEntries: {
        where: { gameId: game.id }
      }
    }
  });
  const entries = players.map((u) => ({
    ...u.storyEntries.at(0),
    nickname: u.nickname
  }));

  const round = getRoundNumber(entries);
  const waitingOnPlayers = entries
    .filter((e) => isBehind(round, e))
    .map((e) => e.nickname);

  if (waitingOnPlayers.length > 0 && round < fillers.length) {
    return { round, waitingOnPlayers: waitingOnPlayers };
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

  return { round, waitingOnPlayers: waitingOnPlayers };
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

export function processValue(entry: string, round: number) {
  let value = entry.replace(quoteRegex, '').trim();
  if (round > 1 && !punctRegex.test(value)) value += '.';
  if (round === 2 || round === 5) {
    value = lowerFirst(value);
  } else {
    value = upperFirst(value);
  }
  return value;
}

export const getStoryStatus = async (
  player: PlayerDto,
  game: GameDto
): Promise<StoryResBody> => {
  const { round, waitingOnPlayers } = await checkRoundCompletion(game);
  const entry = await prisma.storyEntry.findUnique({
    where: {
      gameId_playerId: {
        gameId: game.id,
        playerId: player.id
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
      suggestion: suggestion,
      players: waitingOnPlayers
    };
  } else {
    return {
      phase: GamePhase.READ,
      story: entry?.finalValue,
      isHost: game.hostId === player.id
    };
  }
};

export const saveStoryEntry = async (
  player: PlayerDto,
  game: GameDto,
  value: string
) => {
  if (game.phase !== GamePhase.PLAY) {
    throw new SaveEntryError('Game is not in "PLAY" phase');
  }
  if (!value) {
    throw new SaveEntryError('No value was entered');
  }

  const { round } = await checkRoundCompletion(game);
  const entry = await prisma.storyEntry.findUnique({
    where: {
      gameId_playerId: {
        gameId: game.id,
        playerId: player.id
      }
    }
  });

  if (!entry) {
    await prisma.storyEntry.create({
      data: {
        player: { connect: { id: player.id } },
        game: { connect: { id: game.id } },
        values: [processValue(value, round)],
        finalValue: ''
      }
    });
  } else if (entry.values.length <= round) {
    await prisma.storyEntry.update({
      where: { id: entry.id },
      data: {
        values: [...entry.values, processValue(value, round)]
      }
    });
  } else {
    throw new SaveEntryError('Player has already submitted this round');
  }
};

export const getStoryArchive = async (gameUuid: string) => {
  const entries = await prisma.storyEntry.findMany({
    where: {
      game: { uuid: gameUuid }
    },
    include: { player: true }
  });

  return entries;
};
