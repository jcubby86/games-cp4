/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, jest, test } from '@jest/globals';

import { GamePhase, GameType } from '../../../src/.generated/prisma';
import {
  createGame,
  getGame,
  joinPhase,
  recreateGame,
  updateGamePhase
} from '../../../src/models/games';
import prisma from '../../../src/prisma';

jest.mock('../../../src/prisma');

const prismaMock = prisma as jest.Mocked<typeof prisma>;

describe('createGame', () => {
  test('name game', async () => {
    const mockGame: any = { type: GameType.NAME };
    prismaMock.game.create.mockResolvedValue(mockGame);

    const game = await createGame('name');

    expect(prisma.game.create).toBeCalled();
    expect(game.type).toEqual(GameType.NAME);
  });

  test('story game', async () => {
    const mockGame: any = { type: GameType.STORY };
    prismaMock.game.create.mockResolvedValue(mockGame);

    const game = await createGame('story');

    expect(prisma.game.create).toBeCalled();
    expect(game.type).toEqual(GameType.STORY);
  });

  test('invalid game type', async () => {
    await expect(createGame('bad')).rejects.toThrow('Invalid Game Type');
  });
});

describe('getGame', () => {
  test('success', async () => {
    const mockGame: any = { type: GameType.NAME };
    prismaMock.game.findUniqueOrThrow.mockResolvedValue(mockGame);

    const game = await getGame('NAME');

    expect(prisma.game.findUniqueOrThrow).toBeCalled();
    expect(game.type).toEqual(GameType.NAME);
  });
});

describe('updateGamePhase', () => {
  test('valid type', async () => {
    const mockGame: any = { type: GameType.STORY };
    prismaMock.game.update.mockResolvedValue(mockGame);

    const game = await updateGamePhase('uuid', 'end');

    expect(prisma.game.update).toBeCalled();
    expect(game.type).toEqual(GameType.STORY);
  });

  test('invalid type', async () => {
    await expect(updateGamePhase('uuid', 'story')).rejects.toThrow(
      'Invalid Game Phase'
    );
  });
});

describe('recreateGame', () => {
  test('recreating for first time', async () => {
    const mockGame: any = {};
    prismaMock.game.findUniqueOrThrow.mockResolvedValue(mockGame);
    const newMockGame: any = {};
    prismaMock.game.create.mockResolvedValue(newMockGame);

    const newGame = await recreateGame('uuid');

    expect(prismaMock.game.create).toBeCalled();
    expect(newGame).toEqual(newMockGame);
  });

  test('recreating for second time', async () => {
    const mockGame: any = { successor: {} };
    prismaMock.game.findUniqueOrThrow.mockResolvedValue(mockGame);

    const newGame = await recreateGame('uuid');

    expect(prismaMock.game.create).not.toBeCalled();
    expect(newGame).toEqual(mockGame.successor);
  });
});

describe('joinPhase', () => {
  test('not in JOIN phase', async () => {
    const result = await joinPhase(
      { id: 1, nickname: 'nickname' } as any,
      { id: 1, code: 'code', phase: GamePhase.END, hostId: null } as any
    );
    expect(result).toBeUndefined();
    expect(prismaMock.player.findMany).not.toBeCalled();
  });

  test('in JOIN phase', async () => {
    prismaMock.player.findMany.mockResolvedValue([{ nickname: 'nick' }] as any);

    const result = await joinPhase(
      { id: 1, nickname: 'nickname' } as any,
      { id: 1, code: 'code', phase: GamePhase.JOIN, hostId: null } as any
    );
    expect(result).not.toBeUndefined();
    expect(result?.players).toContainEqual('nick');
  });
});
