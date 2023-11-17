/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, jest, test } from '@jest/globals';

import { GamePhase } from '../../../src/.generated/prisma';
import CannotJoinGameError from '../../../src/errors/CannotJoinGameError';
import { leaveGame, upsertUser } from '../../../src/models/users';
import prisma from '../../../src/prisma';

jest.mock('../../../src/prisma');

const prismaMock = prisma as jest.Mocked<typeof prisma>;

describe('joinGame', () => {
  test('game not found', async () => {
    expect(upsertUser({} as any, 'uuid', 'nick')).rejects.toThrow(
      new CannotJoinGameError("Game with uuid 'uuid' does not exist.")
    );
  });

  test('game in wrong phase', async () => {
    prismaMock.game.findUnique.mockResolvedValue({
      phase: GamePhase.END,
      id: 1
    } as any);

    expect(upsertUser({} as any, 'uuid', 'nick')).rejects.toThrow(
      new CannotJoinGameError("Game with uuid 'uuid' can no longer be joined.")
    );
  });

  test('user not in game', async () => {
    prismaMock.game.findUnique.mockResolvedValue({
      phase: GamePhase.PLAY,
      id: 1
    } as any);

    expect(upsertUser({ gameId: 2 } as any, 'uuid', 'nick')).rejects.toThrow(
      new CannotJoinGameError("Game with uuid 'uuid' can no longer be joined.")
    );

    expect(upsertUser(undefined, 'uuid', 'nick')).rejects.toThrow(
      new CannotJoinGameError("Game with uuid 'uuid' can no longer be joined.")
    );
  });

  test('join successfully updating user', async () => {
    prismaMock.game.findUnique.mockResolvedValue({
      id: 1,
      phase: GamePhase.JOIN
    } as any);
    prismaMock.user.update.mockResolvedValue({
      id: 1,
      nickname: 'nickname',
      gameId: 1
    } as any);

    const user = await upsertUser({ id: 1 } as any, '', '');

    expect(prisma.user.update).toBeCalled();
    expect(prisma.user.create).not.toBeCalled();
    expect(prisma.game.update).toBeCalled();

    expect(user).toMatchObject({ game: { id: 1 } });
  });

  test('join successfully creating user', async () => {
    prismaMock.game.findUnique.mockResolvedValue({
      id: 1,
      phase: GamePhase.JOIN,
      hostId: 2
    } as any);
    prismaMock.user.create.mockResolvedValue({
      id: 1,
      nickname: 'nickname',
      gameId: 1
    } as any);

    const user = await upsertUser(undefined, '', '');

    expect(prisma.user.update).not.toBeCalled();
    expect(prisma.user.create).toBeCalled();
    expect(prisma.game.update).not.toBeCalled();

    expect(user).toMatchObject({ game: { id: 1 } });
  });
});

describe('leaveGame', () => {
  test('no user', async () => {
    await leaveGame(undefined);
    expect(prisma.user.update).not.toBeCalled();
    expect(prisma.user.findMany).not.toBeCalled();
    expect(prisma.game.update).not.toBeCalled();
  });

  test('no game', async () => {
    await leaveGame({} as any);
    expect(prisma.user.update).toBeCalled();
    expect(prisma.user.findMany).not.toBeCalled();
    expect(prisma.game.update).not.toBeCalled();
  });

  test('not host', async () => {
    await leaveGame({ id: 1, game: { hostId: 2 } } as any);
    expect(prisma.user.update).toBeCalled();
    expect(prisma.user.findMany).not.toBeCalled();
    expect(prisma.game.update).not.toBeCalled();
  });

  test('is host, with other users', async () => {
    prismaMock.user.findMany.mockResolvedValue([{ id: 3 }] as any);

    await leaveGame({ id: 1, game: { id: 1, hostId: 1 } } as any);
    expect(prisma.user.update).toBeCalled();
    expect(prisma.user.findMany).toBeCalled();
    expect(prisma.game.update).toBeCalledWith({
      where: { id: 1 },
      data: { hostId: 3 }
    });
  });

  test('is host, no other users', async () => {
    prismaMock.user.findMany.mockResolvedValue([]);

    await leaveGame({ id: 1, game: { id: 1, hostId: 1 } } as any);
    expect(prisma.user.update).toBeCalled();
    expect(prisma.user.findMany).toBeCalled();
    expect(prisma.game.update).toBeCalledWith({
      where: { id: 1 },
      data: { host: { disconnect: true } }
    });
  });
});