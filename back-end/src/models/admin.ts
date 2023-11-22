import * as bcrypt from 'bcrypt';

import AuthenticationError from '../errors/AuthenticationError';
import prisma from '../prisma';

export const hash = async (password: string) => {
  const hashed = await bcrypt.hash(password, 10);
  return hashed;
};

export const compareHash = async (password: string, hash: string) => {
  const result = await bcrypt.compare(password, hash);
  return result;
};

export const login = async (username: string, password: string) => {
  const admin = await prisma.admin.findUniqueOrThrow({ where: { username } });
  const success = await compareHash(password, admin.password);
  if (!success) {
    throw new AuthenticationError();
  } else {
    return { uuid: admin.uuid, username: admin.username };
  }
};

export const createAdmin = async (username: string, password: string) => {
  if (!username || !password) {
    throw new AuthenticationError('Admin credentials not provided');
  }
  const hashed = await hash(password);
  const admin = await prisma.admin.create({
    data: {
      username: username,
      password: hashed
    }
  });
  return admin.uuid;
};

export const get = async (uuid: string) => {
  const admin = await prisma.admin.findUniqueOrThrow({
    where: { uuid },
    select: { uuid: true, username: true }
  });
  return admin;
};
