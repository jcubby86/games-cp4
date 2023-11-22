/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, jest, test } from '@jest/globals';

import { GamePhase } from '../../../src/.generated/prisma';
import CannotJoinGameError from '../../../src/errors/CannotJoinGameError';
import { leaveGame, upsertPlayer } from '../../../src/models/players';
import prisma from '../../../src/prisma';

jest.mock('../../../src/prisma');

const prismaMock = prisma as jest.Mocked<typeof prisma>;

describe('joinGame', () => {
  test('game not found', async () => {
    await expect(upsertPlayer({} as any, 'uuid', 'nick')).rejects.toThrow(
      new CannotJoinGameError("Game with uuid 'uuid' does not exist.")
    );
  });

  test('game in wrong phase', async () => {
    prismaMock.game.findUnique.mockResolvedValue({
      phase: GamePhase.END,
      id: 1
    } as any);

    await expect(upsertPlayer({} as any, 'uuid', 'nick')).rejects.toThrow(
      new CannotJoinGameError("Game with uuid 'uuid' can no longer be joined.")
    );
  });

  test('player not in game', async () => {
    prismaMock.game.findUnique.mockResolvedValue({
      phase: GamePhase.PLAY,
      id: 1
    } as any);

    await expect(
      upsertPlayer({ gameId: 2 } as any, 'uuid', 'nick')
    ).rejects.toThrow(
      new CannotJoinGameError("Game with uuid 'uuid' can no longer be joined.")
    );

    await expect(upsertPlayer(undefined, 'uuid', 'nick')).rejects.toThrow(
      new CannotJoinGameError("Game with uuid 'uuid' can no longer be joined.")
    );
  });

  test('join successfully updating player', async () => {
    prismaMock.game.findUnique.mockResolvedValue({
      id: 1,
      phase: GamePhase.JOIN
    } as any);
    prismaMock.player.update.mockResolvedValue({
      id: 1,
      nickname: 'nickname',
      gameId: 1
    } as any);

    const player = await upsertPlayer({ id: 1 } as any, '', '');

    expect(prisma.player.update).toBeCalled();
    expect(prisma.player.create).not.toBeCalled();
    expect(prisma.game.update).toBeCalled();

    expect(player).toMatchObject({ game: { id: 1 } });
  });

  test('join successfully creating player', async () => {
    prismaMock.game.findUnique.mockResolvedValue({
      id: 1,
      phase: GamePhase.JOIN,
      hostId: 2
    } as any);
    prismaMock.player.create.mockResolvedValue({
      id: 1,
      nickname: 'nickname',
      gameId: 1
    } as any);

    const player = await upsertPlayer(undefined, '', '');

    expect(prisma.player.update).not.toBeCalled();
    expect(prisma.player.create).toBeCalled();
    expect(prisma.game.update).not.toBeCalled();

    expect(player).toMatchObject({ game: { id: 1 } });
  });
});

describe('leaveGame', () => {
  test('no player', async () => {
    await leaveGame(undefined);
    expect(prisma.player.update).not.toBeCalled();
    expect(prisma.player.findMany).not.toBeCalled();
    expect(prisma.game.update).not.toBeCalled();
  });

  test('no game', async () => {
    await leaveGame({ id: 1 } as any);
    expect(prisma.player.update).toBeCalled();
    expect(prisma.player.findMany).not.toBeCalled();
    expect(prisma.game.update).not.toBeCalled();
  });

  test('not host', async () => {
    await leaveGame({ id: 1, game: { id: 1, hostId: 2 } } as any);
    expect(prisma.player.update).toBeCalled();
    expect(prisma.player.findMany).not.toBeCalled();
    expect(prisma.game.update).not.toBeCalled();
  });

  test('is host, with other players', async () => {
    prismaMock.player.findMany.mockResolvedValue([{ id: 3 }] as any);

    await leaveGame({ id: 1, game: { id: 1, hostId: 1 } } as any);
    expect(prisma.player.update).toBeCalled();
    expect(prisma.player.findMany).toBeCalled();
    expect(prisma.game.update).toBeCalledWith({
      where: { id: 1 },
      data: { hostId: 3 }
    });
  });

  test('is host, no other players', async () => {
    prismaMock.player.findMany.mockResolvedValue([]);

    await leaveGame({ id: 1, game: { id: 1, hostId: 1 } } as any);
    expect(prisma.player.update).toBeCalled();
    expect(prisma.player.findMany).toBeCalled();
    expect(prisma.game.update).toBeCalledWith({
      where: { id: 1 },
      data: { host: { disconnect: true } }
    });
  });
});
