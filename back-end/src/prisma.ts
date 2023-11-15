import { PrismaClient } from './.generated/prisma';
import { PROD_ENV, TEST_ENV } from './utils/constants';

function createClient() {
  if (process.env.NODE_ENV === TEST_ENV) {
    return new PrismaClient({
      datasourceUrl: process.env.TEST_DATABASE_URL,
      log: []
    });
  } else if (process.env.NODE_ENV === PROD_ENV) {
    return new PrismaClient({
      log: ['warn', 'error'],
      errorFormat: 'minimal'
    });
  } else {
    return new PrismaClient({
      log: ['info', 'warn', 'error'],
      errorFormat: 'pretty'
    });
  }
}

const prisma = createClient();

export default prisma;
