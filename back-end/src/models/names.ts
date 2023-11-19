import { getSuggestion } from './suggestion';
import { Category, Game, GamePhase } from '../.generated/prisma';
import SaveEntryError from '../errors/SaveEntryError';
import prisma from '../prisma';
import { GameDto, NamesResBody, UserDto } from '../types/domain.js';
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

  const users = await prisma.user.findMany({
    where: { gameId: game.id },
    include: {
      nameEntries: {
        where: { gameId: game.id }
      }
    }
  });

  const waitingOnUsers = users
    .filter((u) => u.nameEntries.at(0) === undefined)
    .map((u) => u.nickname);

  if (waitingOnUsers.length > 0) {
    return waitingOnUsers;
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
  user: UserDto,
  game: GameDto
): Promise<NamesResBody> => {
  const waitingOnUsers = await checkCompletion(game);
  const isHost = game.hostId === user.id;

  if (game.phase === GamePhase.PLAY) {
    const userElem = await prisma.nameEntry.findUnique({
      where: {
        gameId_userId: {
          gameId: game.id,
          userId: user.id
        }
      }
    });

    const category = randomElement(categories);
    const suggestion = await getSuggestion(category);
    return {
      phase: !userElem ? GamePhase.PLAY : WAIT,
      users: waitingOnUsers,
      text: userElem?.name,
      placeholder: suggestion
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
  user: UserDto,
  game: GameDto,
  text: string
) => {
  if (game.phase !== GamePhase.PLAY) {
    throw new SaveEntryError('Game is not in "PLAY" phase');
  }

  const name = upperFirst(text.replace(quoteRegex, '').trim());
  const normalized = name.toUpperCase();

  await prisma.nameEntry.upsert({
    where: {
      gameId_userId: {
        gameId: game.id,
        userId: user.id
      }
    },
    update: {
      name,
      normalized
    },
    create: {
      name,
      normalized,
      userId: user.id,
      gameId: game.id
    }
  });
};
