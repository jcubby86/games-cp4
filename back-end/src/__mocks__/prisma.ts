import { mockDeep, mockReset } from 'jest-mock-extended';

import { PrismaClient } from '../.generated/prisma';

const prismaMock = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(prismaMock);
});

export type MockPrismaClient = typeof prismaMock;
export default prismaMock;
