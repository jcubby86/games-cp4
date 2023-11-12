/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, jest, test } from '@jest/globals';
import { NextFunction } from 'express';

import { GamePhase } from '../src/.generated/prisma';
import { joinPhase, loadUser } from '../src/middleware';
import prisma from '../src/prisma';

jest.mock('../src/prisma');

const prismaMock = prisma as jest.Mocked<typeof prisma>;

describe('loadUser', () => {
  test('No user found', async () => {
    const req: any = { session: { userID: 'z' } };
    const res: any = {};
    const nextFunction: NextFunction = jest.fn();
    const mockUser: any = { uuid: 'uuid' };

    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    await loadUser(req, res, nextFunction);

    expect(prismaMock.user.findUnique).toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();

    expect(req.user).toBe(mockUser);
  });
});

describe('joinPhase', () => {
  test('No user found', async () => {
    const req: any = { game: { phase: GamePhase.JOIN } };
    const res: any = { send: jest.fn() };
    const nextFunction: NextFunction = jest.fn();
    const mockUsers: any[] = [];

    prismaMock.user.findMany.mockResolvedValue(mockUsers);

    await joinPhase(req, res, nextFunction as NextFunction);

    expect(prismaMock.user.findMany).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalledTimes(0);

    expect(req.user).toBeUndefined();
  });
});
