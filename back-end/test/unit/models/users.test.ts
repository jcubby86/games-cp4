/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, jest, test } from '@jest/globals';

import AuthenticationError from '../../../src/errors/AuthenticationError';
import {
  compareHash,
  createUser,
  hash,
  login
} from '../../../src/models/users';
import prisma from '../../../src/prisma';

jest.mock('../../../src/prisma');

const prismaMock = prisma as jest.Mocked<typeof prisma>;

describe('hashing', () => {
  test('should not equal itself', () => {
    expect(hash('password')).resolves.not.toEqual('password');
  });

  test('should not contain itself', async () => {
    const hashed = await hash('password');
    expect(hashed.includes('password')).toBeFalsy();
  });

  test('should not hash to same value twice', async () => {
    const hashed1 = await hash('password');
    const hashed2 = await hash('password');
    expect(hashed1).not.toEqual(hashed2);
  });

  test('should compare correctly', async () => {
    const hashed1 = await hash('password');
    const hashed2 = await hash('password');

    expect(compareHash('password', hashed1)).resolves.toBeTruthy();
    expect(compareHash('password', hashed2)).resolves.toBeTruthy();

    expect(compareHash('password1', hashed1)).resolves.toBeFalsy();
    expect(compareHash('password1', hashed2)).resolves.toBeFalsy();
  });
});

describe('createUser', () => {
  test('validation', () => {
    expect(createUser('', '')).rejects.toThrow(
      new AuthenticationError('User credentials not provided')
    );
    expect(createUser('asdfa', '')).rejects.toThrow(
      new AuthenticationError('User credentials not provided')
    );
    expect(createUser('', 'asdfasdf')).rejects.toThrow(
      new AuthenticationError('User credentials not provided')
    );
  });

  test('successful creation', async () => {
    prismaMock.user.create.mockResolvedValue({
      uuid: '1'
    } as any);

    const result = await createUser('username', 'password');
    expect(result).toMatchObject({ username: 'username', uuid: '1' });
  });

  test('failed creation', async () => {
    prismaMock.user.findUniqueOrThrow.mockImplementation(() => {
      throw new Error();
    });

    expect(login('username', 'aaaa')).rejects.toThrow();
  });
});

describe('login', () => {
  test('successful login', async () => {
    const hashed = await hash('password');
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      id: 1,
      uuid: '1',
      password: hashed,
      username: 'username'
    } as any);

    const result = await login('username', 'password');
    expect(result).toMatchObject({ username: 'username', uuid: '1' });
  });

  test('failed login', async () => {
    const hashed = await hash('password');
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      id: 1,
      uuid: '1',
      password: hashed,
      username: 'username'
    } as any);

    expect(login('username', 'aaaa')).rejects.toThrow(
      new AuthenticationError()
    );
  });
});
