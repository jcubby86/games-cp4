import { PrismaClient } from './.generated/prisma';

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error']
});

export default prisma;
