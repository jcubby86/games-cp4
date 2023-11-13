import { GamePhase, GameType } from '../.generated/prisma';
import { GameDto, UserDto } from '../domain/types.js';
import prisma from '../prisma';

/**
 * Generate a 4 letter string as game code,
 * and make sure that it is not already in use.
 *
 * @return {string}
 */
function getCode(): string {
  //TODO: check to make sure the code isn't used
  const c = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substring(0, 4);
  return c;
}

function getGameType(s: string): GameType {
  return s.toUpperCase() as GameType;
}

function getGamePhase(s: string): GamePhase {
  return s.toUpperCase() as GamePhase;
}

function getGameTitle(type: GameType): string | undefined {
  if (type === GameType.STORY) {
    return 'He Said She Said';
  } else if (type === GameType.NAME) {
    return 'The Name Game';
  } else {
    return undefined;
  }
}

export const createGame = async (gameType: string): Promise<GameDto> => {
  const game = await prisma.game.create({
    data: {
      code: getCode(),
      type: getGameType(gameType),
    },
  });
  return { ...game, title: getGameTitle(game.type) };
};

export const getGame = async (code: string): Promise<GameDto> => {
  const game = await prisma.game.findUniqueOrThrow({
    where: { code },
  });

  return { ...game, title: getGameTitle(game.type) };
};

export const updateGamePhase = async (
  uuid: string,
  phase: string
): Promise<GameDto> => {
  const game = await prisma.game.update({
    where: { uuid },
    data: {
      phase: getGamePhase(phase),
    },
  });
  return game;
};

export const getUsers = async (uuid: string): Promise<UserDto[]> => {
  const users = await prisma.user.findMany({
    where: {
      game: { uuid },
    },
  });
  return users;
};

export const recreateGame = async (oldGameUuid: string): Promise<GameDto> => {
  const oldGame = await prisma.game.findUniqueOrThrow({
    where: {
      uuid: oldGameUuid,
    },
    include: {
      successor: true,
    },
  });
  if (oldGame.successor) {
    return oldGame.successor;
  } else {
    const newGame = await prisma.game.create({
      data: {
        code: getCode(),
        type: oldGame.type,
        predecessor: {
          connect: {
            id: oldGame.id,
          },
        },
      },
    });
    return newGame;
  }
};
