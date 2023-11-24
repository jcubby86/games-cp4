import { getSuggestion } from './suggestion';
import { Category, Game, GamePhase } from '../.generated/prisma';
import SaveEntryError from '../errors/SaveEntryError';
import prisma from '../prisma';
import { GameDto, NamesResBody, PlayerDto } from '../types/domain.js';
import { WAIT, quoteRegex } from '../utils/constants.js';
import { randomElement, shuffleArray, upperFirst } from '../utils/utils.js';

const categories = [Category.MALE_NAME, Category.FEMALE_NAME];

/**
 * Check if all players have submitted an entry.
 *
 * @param {Game} game
 * @return {*}  {Promise<string[]>}
 */
export async function checkCompletion(game: Game): Promise<string[]> {
  if (game.phase !== GamePhase.PLAY) return [];

  const players = await prisma.player.findMany({
    where: { gameId: game.id },
    include: {
      nameEntries: {
        where: { gameId: game.id }
      }
    }
  });

  const waitingOnPlayers = players
    .filter((u) => u.nameEntries.at(0) === undefined)
    .map((u) => u.nickname);

  if (waitingOnPlayers.length > 0) {
    return waitingOnPlayers;
  }

  if ((game.phase as GamePhase) !== GamePhase.READ) {
    game.phase = GamePhase.READ;
    await prisma.game.update({
      where: { id: game.id },
      data: { phase: GamePhase.READ }
    });
  }

  return [];
}

export const getNameStatus = async (
  player: PlayerDto,
  game: GameDto
): Promise<NamesResBody> => {
  const waitingOnPlayers = await checkCompletion(game);
  const isHost = game.hostId === player.id;

  if (game.phase === GamePhase.PLAY) {
    const entry = await prisma.nameEntry.findUnique({
      where: {
        gameId_playerId: {
          gameId: game.id,
          playerId: player.id
        }
      }
    });

    const category = randomElement(categories);
    const suggestion = await getSuggestion(category);
    return {
      phase: !entry ? GamePhase.PLAY : WAIT,
      players: waitingOnPlayers,
      suggestion: suggestion
    };
  } else if (game.phase === GamePhase.READ) {
    const entries = await prisma.nameEntry.findMany({
      where: { gameId: game.id }
    });
    shuffleArray(entries);
    return {
      phase: GamePhase.READ,
      names: entries.map((elem) => elem.name),
      isHost: isHost
    };
  } else {
    return {
      phase: GamePhase.END,
      isHost: isHost
    };
  }
};

export const saveNameEntry = async (
  player: PlayerDto,
  game: GameDto,
  value: string
) => {
  if (game.phase !== GamePhase.PLAY) {
    throw new SaveEntryError('Game is not in "PLAY" phase');
  }
  if (!value) {
    throw new SaveEntryError('No name was entered');
  }

  const name = upperFirst(value.replace(quoteRegex, '').trim());
  const normalized = name.toUpperCase();

  await prisma.nameEntry.upsert({
    where: {
      gameId_playerId: {
        gameId: game.id,
        playerId: player.id
      }
    },
    update: {
      name,
      normalized
    },
    create: {
      name,
      normalized,
      playerId: player.id,
      gameId: game.id
    }
  });
};
