/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, jest, test } from '@jest/globals';
import { NextFunction } from 'express';

import { GamePhase, GameType, User } from '../src/.generated/prisma';
import { joinPhase, loadNames, loadStory, loadUser } from '../src/middleware';
import prisma from '../src/prisma';

jest.mock('../src/prisma');

const prismaMock = prisma as jest.Mocked<typeof prisma>;
const nextFunction: NextFunction = jest.fn();
const res: any = { send: jest.fn(), sendStatus: jest.fn() };

describe('loadUser', () => {
  test('No session', async () => {
    const req: any = {};

    await loadUser(req, res, nextFunction);

    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();
    expect(req.user).toBeUndefined();
  });

  test('User not found', async () => {
    const req: any = { session: { userID: 'z' } };

    prismaMock.user.findUnique.mockResolvedValue(null as any);

    await loadUser(req, res, nextFunction);

    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();
    expect(req.user).toBeUndefined();
  });

  test('User found', async () => {
    const req: any = { session: { userID: 'z' } };
    const mockUser: any = { uuid: 'uuid', game: {} };

    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    await loadUser(req, res, nextFunction);

    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();
    expect(req.user).toBe(mockUser);
  });

  test('Error', async () => {
    const req: any = { session: { userID: 'z' } };
    const err = new Error();

    prismaMock.user.findUnique.mockImplementation(() => {
      throw err;
    });

    await loadUser(req, res, nextFunction);

    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith(err);
    expect(req.user).toBeUndefined();
  });
});

describe('joinPhase', () => {
  test('happy path', async () => {
    const req: any = {
      game: { phase: GamePhase.JOIN, code: '1234' },
      user: {
        nickname: 'nickname',
      },
    };
    const mockUsers: any[] = [{ nickname: 'nick' }];

    prismaMock.user.findMany.mockResolvedValue(mockUsers);

    await joinPhase(req, res, nextFunction);

    expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1);
    expect(nextFunction).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toMatchObject({
      phase: GamePhase.JOIN,
      users: ['nick'],
      nickname: 'nickname',
      code: '1234',
    });
  });

  test('Not join phase', async () => {
    const req: any = { game: { phase: GamePhase.END } };
    const mockUsers: User[] = [];

    prismaMock.user.findMany.mockResolvedValue(mockUsers);

    await joinPhase(req, res, nextFunction);

    expect(prismaMock.user.findMany).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();
  });

  test('Error', async () => {
    const req: any = { game: { phase: GamePhase.JOIN } };
    const err = new Error();

    prismaMock.user.findMany.mockImplementation(() => {
      throw err;
    });

    await joinPhase(req, res, nextFunction);

    expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1);
    expect(res.send).not.toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith(err);
  });
});

describe('loadNames', () => {
  test('no game', async () => {
    const req: any = {};

    await loadNames(req, res, nextFunction);

    expect(res.sendStatus).toHaveBeenCalledWith(403);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('wrong game type', async () => {
    const req: any = { game: { type: GameType.STORY }, user: {} };

    await loadNames(req, res, nextFunction);

    expect(res.sendStatus).toHaveBeenCalledWith(400);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('happy path', async () => {
    const req: any = { game: { type: GameType.NAME }, user: {} };

    await loadNames(req, res, nextFunction);

    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();
  });
});

describe('loadStory', () => {
  test('no game', async () => {
    const req: any = {};

    await loadStory(req, res, nextFunction);

    expect(res.sendStatus).toHaveBeenCalledWith(403);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('wrong game type', async () => {
    const req: any = { game: { type: GameType.NAME }, user: {} };

    await loadStory(req, res, nextFunction);

    expect(res.sendStatus).toHaveBeenCalledWith(400);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('happy path', async () => {
    const req: any = { game: { type: GameType.STORY }, user: {} };

    await loadStory(req, res, nextFunction);

    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();
  });
});
