import { GamePhase, Prisma } from '../.generated/prisma';
import CannotJoinGameError from '../errors/CannotJoinGameError.js';
import prisma from '../prisma.js';
import { PlayerDto } from '../types/domain.js';

/**
 * Join a game.
 * If the player already has a session, we update the session/player
 * rather than creating a new one.
 */
export const upsertPlayer = async (
  player: PlayerDto | undefined,
  gameUuid: string,
  nickname: string
): Promise<PlayerDto> => {
  try {
    const game = await prisma.game.findUnique({
      where: { uuid: gameUuid }
    });
    if (!game) {
      throw new CannotJoinGameError(
        `Game with uuid '${gameUuid}' does not exist.`
      );
    } else if (game.phase !== GamePhase.JOIN && player?.gameId !== game.id) {
      throw new CannotJoinGameError(
        `Game with uuid '${gameUuid}' can no longer be joined.`
      );
    }

    if (!player) {
      player = await prisma.player.create({
        data: {
          nickname: nickname,
          game: {
            connect: { id: game.id }
          }
        }
      });
    } else {
      player = await prisma.player.update({
        where: { id: player.id },
        data: {
          nickname: nickname,
          game: {
            connect: { id: game.id }
          }
        }
      });
    }

    if (!game.hostId) {
      await prisma.game.update({
        where: { id: game.id },
        data: { host: { connect: { id: player.id } } }
      });
      game.hostId = player.id;
    }

    player.game = game;

    return player;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        throw new CannotJoinGameError('Nickname is already taken.');
      }
    }
    throw err;
  }
};

export const leaveGame = async (player?: PlayerDto) => {
  if (player) {
    await prisma.player.update({
      where: { id: player.id },
      data: { game: { disconnect: true } }
    });
    if (player.game && player.game.hostId === player.id) {
      const players = await prisma.player.findMany({
        where: { gameId: player.game.id }
      });
      if (players.length > 0) {
        await prisma.game.update({
          where: { id: player.game.id },
          data: { hostId: players[0].id }
        });
      } else {
        await prisma.game.update({
          where: { id: player.game.id },
          data: { host: { disconnect: true } }
        });
      }
    }
  }
};

export const getPlayer = async (uuid: string): Promise<PlayerDto | null> => {
  const player = await prisma.player.findUnique({
    where: { uuid },
    include: { game: true }
  });
  return player;
};

export const getPlayersByGameId = async (
  gameId: number
): Promise<PlayerDto[]> => {
  const players = await prisma.player.findMany({
    where: { gameId }
  });
  return players;
};

export const getPlayersByGameUuid = async (
  uuid: string
): Promise<PlayerDto[]> => {
  const players = await prisma.player.findMany({
    where: { game: { uuid } }
  });
  return players;
};
