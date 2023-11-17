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
    expect(game).toMatchObject({
      type: GameType.NAME,
      title: 'The Name Game'
    });
  });

  test('story game', async () => {
    const mockGame: any = { type: GameType.STORY };
    prismaMock.game.create.mockResolvedValue(mockGame);

    const game = await createGame('story');

    expect(prisma.game.create).toBeCalled();
    expect(game).toMatchObject({
      type: GameType.STORY,
      title: 'He Said She Said'
    });
  });

  test('invalid game type', async () => {
    expect(createGame('bad')).rejects.toThrow('Invalid Game Type');
  });
});

describe('getGame', () => {
  test('success', async () => {
    const mockGame: any = { type: GameType.NAME };
    prismaMock.game.findUniqueOrThrow.mockResolvedValue(mockGame);

    const game = await getGame('NAME');

    expect(prisma.game.findUniqueOrThrow).toBeCalled();
    expect(game).toMatchObject({
      type: GameType.NAME,
      title: 'The Name Game'
    });
  });
});

describe('updateGamePhase', () => {
  test('valid type', async () => {
    const mockGame: any = { type: GameType.STORY };
    prismaMock.game.update.mockResolvedValue(mockGame);

    const game = await updateGamePhase('uuid', 'end');

    expect(prisma.game.update).toBeCalled();
    expect(game).toMatchObject({
      type: GameType.STORY
    });
  });

  test('invalid type', async () => {
    expect(updateGamePhase('uuid', 'story')).rejects.toThrow(
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
    const game = { phase: GamePhase.END };

    const result = await joinPhase({} as any, game as any);
    expect(result).toBeUndefined();
    expect(prismaMock.user.findMany).not.toBeCalled();
  });

  test('in JOIN phase', async () => {
    const game = { phase: GamePhase.JOIN };
    prismaMock.user.findMany.mockResolvedValue([{ nickname: 'nick' }] as any);

    const result = await joinPhase({} as any, game as any);
    expect(result).not.toBeUndefined();
    expect(result?.users).toContainEqual('nick');
  });
});
