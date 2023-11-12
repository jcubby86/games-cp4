import { mockDeep, mockReset } from 'jest-mock-extended';

import { PrismaClient } from '../.generated/prisma';

// console.log('MOCK');

const prismaMock = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(prismaMock);
});

export default prismaMock;
