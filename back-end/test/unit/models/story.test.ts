/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, jest, test } from '@jest/globals';

import { GamePhase } from '../../../src/.generated/prisma';
import SaveEntryError from '../../../src/errors/SaveEntryError';
import {
  checkRoundCompletion,
  getRoundNumber,
  getStoryStatus,
  isBehind,
  processValue,
  saveStoryEntry
} from '../../../src/models/story';
import prisma from '../../../src/prisma';
import { WAIT } from '../../../src/utils/constants';

jest.mock('../../../src/prisma');
jest.mock('../../../src/utils/utils');

const prismaMock = prisma as jest.Mocked<typeof prisma>;

test('getRoundNumber', () => {
  expect(getRoundNumber([])).toEqual(0);
  expect(getRoundNumber([{ values: [] }, {}])).toEqual(0);
  expect(getRoundNumber([{ values: ['1'] }, {}])).toEqual(0);
  expect(getRoundNumber([{ values: ['1', '2'] }, { values: ['1'] }])).toEqual(
    1
  );
  expect(
    getRoundNumber([
      { values: ['1', '2', '3', '4', '5'] },
      { values: ['1', '2'] },
      { values: ['1', '2', '3'] }
    ])
  ).toEqual(2);
});

test('isBehind', () => {
  expect(isBehind(1, null)).toBeTruthy();
  expect(isBehind(1, { values: ['1'] })).toBeTruthy();
  expect(isBehind(3, { values: ['1', '2'] })).toBeTruthy();
  expect(isBehind(1, { values: ['1', '2'] })).toBeFalsy();
  expect(isBehind(3, { values: ['1', '2', '3', '4'] })).toBeFalsy();
});

test('processValue', () => {
  expect(processValue('hello', 0)).toEqual('Hello');
  expect(processValue('Hello!', 3)).toEqual('Hello!');
  expect(processValue('Hello', 2)).toEqual('hello.');
  expect(processValue('Hello!', 2)).toEqual('hello!');
  expect(processValue('hello?', 5)).toEqual('hello?');
});

describe('checkRoundCompletion', () => {
  test('end phase', async () => {
    await expect(
      checkRoundCompletion({ id: 1, phase: GamePhase.END } as any)
    ).resolves.toMatchObject({ round: 0, waitingOnUsers: [] });
    expect(prismaMock.user.findMany).not.toBeCalled();
    expect(prismaMock.$transaction).not.toBeCalled();
    expect(prismaMock.storyEntry.update).not.toBeCalled();
    expect(prisma.game.update).not.toBeCalled();
  });

  test('users behind, round 0', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { storyEntries: [], nickname: 'test' }
    ] as any);

    await expect(
      checkRoundCompletion({ id: 1, phase: GamePhase.PLAY } as any)
    ).resolves.toMatchObject({
      round: 0,
      waitingOnUsers: ['test']
    });
    expect(prismaMock.$transaction).not.toBeCalled();
    expect(prismaMock.storyEntry.update).not.toBeCalled();
    expect(prisma.game.update).not.toBeCalled();
  });

  test('round 6', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      {
        storyEntries: [{ id: 1, values: ['11', '12', '13', '14', '15', '16'] }],
        nickname: 'test1'
      },
      {
        storyEntries: [{ id: 2, values: ['21', '22', '23', '24', '25', '26'] }],
        nickname: 'test2'
      }
    ] as any);

    const game: any = { id: 1, phase: GamePhase.PLAY };
    await expect(checkRoundCompletion(game)).resolves.toMatchObject({
      round: 6
    });
    expect(game.phase).toEqual(GamePhase.READ);
    expect(prisma.game.update).toBeCalled();

    expect(prismaMock.$transaction).toBeCalled();

    expect(prismaMock.storyEntry.update).toBeCalledTimes(2);
    expect(prismaMock.storyEntry.update).toHaveBeenNthCalledWith(1, {
      data: {
        finalValue: '11 and 22 were 13 He said, "24" She said, "15" So they 26 '
      },
      where: { id: 1 }
    });
    expect(prismaMock.storyEntry.update).toHaveBeenNthCalledWith(2, {
      data: {
        finalValue: '21 and 12 were 23 He said, "14" She said, "25" So they 16 '
      },
      where: { id: 2 }
    });
  });
});

describe('getStoryStatus', () => {
  test('play', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { storyEntries: [], nickname: 'test' }
    ] as any);
    prismaMock.storyEntry.findUnique.mockResolvedValue({
      values: []
    } as any);
    prismaMock.suggestion.findMany.mockResolvedValue([
      { value: 'suggestion' }
    ] as any);
    const result = await getStoryStatus(
      {} as any,
      { phase: GamePhase.PLAY } as any
    );

    expect(result).toMatchObject({
      phase: GamePhase.PLAY,
      round: 0,
      prompt: "Man's name:",
      placeholder: 'suggestion'
    });
  });

  test('play wait', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { storyEntries: [], nickname: 'test' }
    ] as any);
    prismaMock.storyEntry.findUnique.mockResolvedValue({
      values: ['']
    } as any);
    prismaMock.suggestion.findMany.mockResolvedValue([
      { value: 'suggestion' }
    ] as any);
    const result = await getStoryStatus(
      {} as any,
      { phase: GamePhase.PLAY } as any
    );

    expect(result).toMatchObject({
      phase: WAIT,
      round: 0,
      prompt: "Man's name:",
      placeholder: 'suggestion'
    });
  });

  test('read', async () => {
    prismaMock.storyEntry.findUnique.mockResolvedValue({
      finalValue: 'hello there'
    } as any);

    const result = await getStoryStatus(
      {} as any,
      { phase: GamePhase.READ } as any
    );

    expect(result).toMatchObject({
      phase: GamePhase.READ,
      story: 'hello there'
    });
  });
});

describe('saveStoryEntry', () => {
  test('wrong phase', async () => {
    await expect(
      saveStoryEntry({} as any, { phase: GamePhase.END } as any, 'entry')
    ).rejects.toThrow(new SaveEntryError('Game is not in "PLAY" phase'));

    expect(prisma.storyEntry.create).not.toBeCalled();
    expect(prisma.storyEntry.update).not.toBeCalled();
  });

  test('has never submitted', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { storyEntries: [], nickname: 'test' }
    ] as any);

    await saveStoryEntry({} as any, { phase: GamePhase.PLAY } as any, 'entry');

    expect(prisma.storyEntry.create).toBeCalled();
    expect(prisma.storyEntry.update).not.toBeCalled();
  });

  test('has submitted in previous round', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { storyEntries: [''], nickname: 'test' }
    ] as any);
    prismaMock.storyEntry.findUnique.mockResolvedValue({ values: [] } as any);

    await saveStoryEntry({} as any, { phase: GamePhase.PLAY } as any, 'entry');

    expect(prisma.storyEntry.create).not.toBeCalled();
    expect(prisma.storyEntry.update).toBeCalled();
  });

  test('has submitted in current round', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { storyEntries: [], nickname: 'test' }
    ] as any);
    prismaMock.storyEntry.findUnique.mockResolvedValue({ values: [''] } as any);

    await expect(
      saveStoryEntry({} as any, { phase: GamePhase.PLAY } as any, 'entry')
    ).rejects.toThrow(
      new SaveEntryError('User has already submitted this round')
    );

    expect(prisma.storyEntry.create).not.toBeCalled();
    expect(prisma.storyEntry.update).not.toBeCalled();
  });
});
