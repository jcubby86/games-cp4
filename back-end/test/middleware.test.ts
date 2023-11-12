/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, jest, test } from '@jest/globals';
import { NextFunction } from 'express';

import { GamePhase } from '../src/.generated/prisma';
import { joinPhase, loadUser } from '../src/middleware';
import server from '../src/server.js';

const prisma = server as jest.Mocked<typeof server>;

jest.mock('../src/server.js', () => {
  return {
    __esModule: true,
    default: { user: { findUnique: jest.fn(), findMany: jest.fn() } },
  };
});

describe('loadUser', () => {
  test('No user found', async () => {
    const nextFunction = jest.fn();
    const req: any = { session: { userID: 'z' } };

    prisma.user.findUnique.mockReturnValue({} as any);

    await loadUser(req, {} as any, nextFunction as NextFunction);

    expect(prisma.user.findUnique).toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();

    expect(req.user).toMatchObject({});
  });
});

describe('joinPhase', () => {
  test('No user found', async () => {
    const nextFunction = jest.fn();
    const req: any = { game: { phase: GamePhase.JOIN } };
    const res: any = { send: jest.fn() };

    prisma.user.findMany.mockReturnValue([] as any);

    await joinPhase(req, res, nextFunction as NextFunction);

    expect(prisma.user.findMany).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalledTimes(0);

    expect(req.user).toBeUndefined();
  });
});
