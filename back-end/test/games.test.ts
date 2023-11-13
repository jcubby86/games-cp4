/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, jest, test } from '@jest/globals';

import { GameType } from '../src/.generated/prisma';
import { createGame, getGame } from '../src/models/games';
import prisma from '../src/prisma';

jest.mock('../src/prisma');

const prismaMock = prisma as jest.Mocked<typeof prisma>;

describe('createGame', () => {
  test('happy path', async () => {
    const mockGame: any = { type: GameType.NAME };
    prismaMock.game.create.mockResolvedValue(mockGame);

    const game = await createGame('NAME');

    expect(prisma.game.create).toBeCalled();
    expect(game).toMatchObject({
      type: GameType.NAME,
      title: 'The Name Game',
    });
  });

  test('error', async () => {
    prismaMock.game.create.mockImplementation(() => {
      throw new Error();
    });

    expect(createGame('')).rejects.toThrow();
  });
});

describe('getGame', () => {
  test('happy path', async () => {
    const mockGame: any = { type: GameType.NAME };
    prismaMock.game.findUniqueOrThrow.mockResolvedValue(mockGame);

    const game = await getGame('NAME');

    expect(prisma.game.findUniqueOrThrow).toBeCalled();
    expect(game).toMatchObject({
      type: GameType.NAME,
      title: 'The Name Game',
    });
  });

  test('error', async () => {
    prismaMock.game.findUniqueOrThrow.mockImplementation(() => {
      throw new Error();
    });

    expect(getGame('')).rejects.toThrow();
  });
});
