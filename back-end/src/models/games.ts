import { getUsersByGameId } from './users';
import { GamePhase, GameType } from '../.generated/prisma';
import prisma from '../prisma';
import { GameDto, JoinResBody, UserDto } from '../types/domain.js';

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

function getGameType(type: string): GameType {
  const normalized = type.toUpperCase();
  if ((Object.values(GameType) as string[]).includes(normalized)) {
    return normalized as GameType;
  } else {
    throw new Error('Invalid Game Type');
  }
}

function getGamePhase(phase: string): GamePhase {
  const normalized = phase.toUpperCase();
  if ((Object.values(GamePhase) as string[]).includes(normalized)) {
    return normalized as GamePhase;
  } else {
    throw new Error('Invalid Game Phase');
  }
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
      type: getGameType(gameType)
    }
  });
  return { ...game, title: getGameTitle(game.type) };
};

export const getGame = async (code: string): Promise<GameDto> => {
  const game = await prisma.game.findUniqueOrThrow({
    where: { code }
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
      phase: getGamePhase(phase)
    }
  });
  return game;
};

export const recreateGame = async (oldGameUuid: string): Promise<GameDto> => {
  const oldGame = await prisma.game.findUniqueOrThrow({
    where: {
      uuid: oldGameUuid
    },
    include: {
      successor: true
    }
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
            id: oldGame.id
          }
        }
      }
    });
    return newGame;
  }
};

export const joinPhase = async (
  user: UserDto,
  game: GameDto
): Promise<JoinResBody | undefined> => {
  if (game.phase === GamePhase.JOIN) {
    const users = await getUsersByGameId(game.id);
    return {
      phase: GamePhase.JOIN,
      users: users.map((user) => user.nickname),
      code: game.code,
      nickname: user.nickname,
      isHost: game.hostId === user.id
    };
  }
  return undefined;
};
