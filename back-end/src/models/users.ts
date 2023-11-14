import { GamePhase } from '../.generated/prisma';
import { UserDto } from '../domain/types.js';
import CannotJoinGameError from '../errors/CannotJoinGameError';
import prisma from '../prisma';

/**
 * Join a game.
 * If the user already has a session, we update the session/user
 * rather than creating a new one.
 */
export const upsertUser = async (
  user: UserDto | undefined,
  gameUuid: string,
  nickname: string
): Promise<UserDto> => {
  const game = await prisma.game.findUnique({
    where: { uuid: gameUuid },
  });
  if (!game || !(game?.phase === GamePhase.JOIN || user?.gameId === game.id)) {
    const message = `Game with code ${game?.code} does not exist or can no longer be joined.`;
    throw new CannotJoinGameError(message);
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        nickname: nickname,
        game: {
          connect: { id: game.id },
        },
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        nickname: nickname,
        game: {
          connect: { id: game.id },
        },
      },
    });
  }

  if (!game.hostId) {
    await prisma.game.update({
      where: { id: game.id },
      data: { host: { connect: { id: user.id } } },
    });
  }

  user.game = game;

  return user;
};

export const leaveGame = async (user?: UserDto) => {
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { game: { disconnect: true } },
    });
    if (user.game && user.game.hostId === user.id) {
      const users = await prisma.user.findMany({
        where: { gameId: user.game.id },
      });
      if (users.length > 0) {
        await prisma.game.update({
          where: { id: user.game.id },
          data: { hostId: users[0].id },
        });
      } else {
        await prisma.game.update({
          where: { id: user.game.id },
          data: { host: { disconnect: true } },
        });
      }
    }
  }
};

export const getUser = async (uuid: string): Promise<UserDto | null> => {
  const user = await prisma.user.findUnique({
    where: { uuid },
    include: { game: true },
  });
  return user;
};

export const getUsersByGameId = async (gameId: number): Promise<UserDto[]> => {
  const users = await prisma.user.findMany({
    where: { gameId },
  });
  return users;
};

export const getUsersByGameUuid = async (uuid: string): Promise<UserDto[]> => {
  const users = await prisma.user.findMany({
    where: { game: { uuid } },
  });
  return users;
};
