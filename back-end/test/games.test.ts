/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, jest, test } from '@jest/globals';
import { NextFunction } from 'express';

import { GameType } from '../src/.generated/prisma';
import { createGame, getGame } from '../src/games';
import prisma from '../src/prisma';

jest.mock('../src/prisma');

const prismaMock = prisma as jest.Mocked<typeof prisma>;
const next: NextFunction = jest.fn();
const res: any = {
  send: jest.fn(),
  sendStatus: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  status: function (code: number) {
    return this;
  },
};

describe('createGame', () => {
  test('happy path', async () => {
    const req: any = { body: { type: 'NAME' } };
    const game: any = { type: GameType.NAME };

    prismaMock.game.create.mockResolvedValue(game);

    await createGame(req, res, next);

    expect(prisma.game.create).toBeCalledTimes(1);
    expect(res.send).toBeCalled();
    expect(res.send.mock.calls[0][0]).toMatchObject({
      type: GameType.NAME,
      title: 'The Name Game',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('error', async () => {
    const req: any = { body: { type: 'NAME' } };
    const err = new Error();

    prismaMock.game.create.mockImplementation(() => {
      throw err;
    });

    await createGame(req, res, next);

    expect(res.send).not.toBeCalled();
    expect(next).toBeCalledWith(err);
  });
});

describe('getGame', () => {
  test('happy path', async () => {
    const req: any = { params: { code: 'abcd' } };
    const game: any = { type: GameType.NAME };

    prismaMock.game.findUniqueOrThrow.mockResolvedValue(game);

    await getGame(req, res, next);

    expect(res.send).toBeCalled();
    expect(next).not.toBeCalled();
  });

  test('error', async () => {
    const req: any = { params: { code: 'abcd' } };
    const err = new Error();

    prismaMock.game.findUniqueOrThrow.mockImplementation(() => {
      throw err;
    });

    await getGame(req, res, next);

    expect(res.send).not.toBeCalled();
    expect(next).toBeCalledWith(err);
  });
});
