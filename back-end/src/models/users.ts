import * as bcrypt from 'bcrypt';

import { User } from '../.generated/prisma';
import AuthenticationError from '../errors/AuthenticationError';
import prisma from '../prisma';
import { SUGGESTIONS_PERM } from '../utils/constants';

export const hash = async (password: string) => {
  const hashed = await bcrypt.hash(password, 10);
  return hashed;
};

export const compareHash = async (password: string, hash: string) => {
  const result = await bcrypt.compare(password, hash);
  return result;
};

export const login = async (username: string, password: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { username } });
  const success = await compareHash(password, user.password);
  if (!success) {
    throw new AuthenticationError();
  } else {
    return {
      uuid: user.uuid,
      username: user.username,
      permissions: user.permissions
    };
  }
};

export const createUser = async (username: string, password: string) => {
  if (!username || !password) {
    throw new AuthenticationError('User credentials not provided');
  }
  const hashed = await hash(password);
  const user: User = await prisma.user.create({
    data: {
      username: username,
      password: hashed,
      permissions: [SUGGESTIONS_PERM]
    }
  });
  return { uuid: user.uuid, username: username, permissions: user.permissions };
};

export const get = async (uuid: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { uuid },
    select: { uuid: true, username: true, permissions: true }
  });
  return user;
};
