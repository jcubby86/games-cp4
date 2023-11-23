import { Prisma } from '../src/.generated/prisma';
import { main } from '../src/utils/seed';

main().catch((err) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return;
    }
  }
  console.warn('Error While generating Seed: \n', err);
});
