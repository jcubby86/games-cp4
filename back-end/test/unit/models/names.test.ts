/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, jest, test } from '@jest/globals';

import { GamePhase } from '../../../src/.generated/prisma';
import SaveEntryError from '../../../src/errors/SaveEntryError';
import {
  checkCompletion,
  getNameStatus,
  saveNameEntry
} from '../../../src/models/names';
import prisma from '../../../src/prisma';
import { WAIT } from '../../../src/utils/constants';

jest.mock('../../../src/prisma');
jest.mock('../../../src/utils/utils');

const prismaMock = prisma as jest.Mocked<typeof prisma>;

describe('checkRoundCompletion', () => {
  test('end phase', async () => {
    await expect(
      checkCompletion({ id: 1, phase: GamePhase.END } as any)
    ).resolves.toEqual([]);
    expect(prismaMock.player.findMany).not.toBeCalled();
    expect(prisma.game.update).not.toBeCalled();
  });

  test('not complete', async () => {
    prismaMock.player.findMany.mockResolvedValue([
      { nameEntries: [], nickname: 'test' }
    ] as any);

    await expect(
      checkCompletion({ id: 1, phase: GamePhase.PLAY } as any)
    ).resolves.toEqual(['test']);
    expect(prismaMock.nameEntry.update).not.toBeCalled();
    expect(prisma.game.update).not.toBeCalled();
  });

  test('complete', async () => {
    prismaMock.player.findMany.mockResolvedValue([
      {
        nameEntries: [{ id: 1, name: '1' }],
        nickname: 'test1'
      },
      {
        nameEntries: [{ id: 1, name: '2' }],
        nickname: 'test2'
      }
    ] as any);

    const game: any = { id: 1, phase: GamePhase.PLAY };
    await expect(checkCompletion(game)).resolves.toEqual([]);
    expect(game.phase).toEqual(GamePhase.READ);
    expect(prisma.game.update).toBeCalledWith({
      where: { id: 1 },
      data: { phase: GamePhase.READ }
    });
  });
});

describe('getNameStatus', () => {
  test('play', async () => {
    prismaMock.player.findMany.mockResolvedValue([
      { nameEntries: [], nickname: 'test' }
    ] as any);
    prismaMock.nameEntry.findUnique.mockResolvedValue(null);
    prismaMock.suggestion.findMany.mockResolvedValue([
      { value: 'suggestion' }
    ] as any);
    const result = await getNameStatus(
      {} as any,
      { phase: GamePhase.PLAY } as any
    );

    expect(result).toMatchObject({
      phase: GamePhase.PLAY,
      suggestion: { value: 'suggestion' }
    });
  });

  test('play wait', async () => {
    prismaMock.player.findMany.mockResolvedValue([
      { nameEntries: [], nickname: 'test' }
    ] as any);
    prismaMock.nameEntry.findUnique.mockResolvedValue({} as any);
    prismaMock.suggestion.findMany.mockResolvedValue([
      { value: 'suggestion' }
    ] as any);
    const result = await getNameStatus(
      {} as any,
      { phase: GamePhase.PLAY } as any
    );

    expect(result).toMatchObject({
      phase: WAIT,
      players: ['test']
    });
  });

  test('read', async () => {
    prismaMock.nameEntry.findMany.mockResolvedValue([
      { name: '1' },
      { name: '2' }
    ] as any);

    const result = await getNameStatus(
      {} as any,
      { phase: GamePhase.READ } as any
    );

    expect(result).toMatchObject({
      phase: GamePhase.READ,
      names: ['1', '2']
    });
  });

  test('end', async () => {
    const result = await getNameStatus(
      {} as any,
      { phase: GamePhase.END } as any
    );

    expect(result).toMatchObject({
      phase: GamePhase.END
    });
  });
});

describe('saveNameEntry', () => {
  test('wrong phase', async () => {
    await expect(
      saveNameEntry({} as any, { phase: GamePhase.END } as any, '')
    ).rejects.toThrow(new SaveEntryError('Game is not in "PLAY" phase'));

    expect(prisma.nameEntry.create).not.toBeCalled();
    expect(prisma.nameEntry.update).not.toBeCalled();
  });

  test('success', async () => {
    await saveNameEntry({} as any, { phase: GamePhase.PLAY } as any, 'entry');

    expect(prisma.nameEntry.upsert).toBeCalled();
  });
});
