import { parseArgs } from 'node:util';

import { Prisma } from '../src/.generated/prisma';
import { main } from '../src/utils/seed';


const {
  values: { env }
} = parseArgs({
  options: {
    env: { type: 'string' }
  }
});

main(env).catch((err) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return;
    }
  }
  console.warn('Error While generating Seed: \n', err);
});
