import { PrismaClient, Category, Prisma } from '../src/.generated/prisma';
import actions_past from '../src/suggestion/actions_past';
import actions_present from '../src/suggestion/actions_present';
import female_names from '../src/suggestion/female_names';
import male_names from '../src/suggestion/male_names';
import statements from '../src/suggestion/statements';

const prisma = new PrismaClient();

async function main() {
  const arr: Prisma.SuggestionCreateInput[] = [];
  arr.push(
    ...actions_past.map((s) => ({ value: s, category: Category.PAST_ACTION }))
  );
  arr.push(
    ...actions_present.map((s) => ({
      value: s,
      category: Category.PRESENT_ACTION,
    }))
  );
  arr.push(
    ...female_names.map((s) => ({ value: s, category: Category.FEMALE_NAME }))
  );
  arr.push(
    ...male_names.map((s) => ({ value: s, category: Category.MALE_NAME }))
  );
  arr.push(
    ...statements.map((s) => ({ value: s, category: Category.STATEMENT }))
  );

  await prisma.suggestion.createMany({
    data: arr,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      console.log('Already seeded');
      await prisma.$disconnect();
    } else {
      console.error(err);
      await prisma.$disconnect();
      process.exit(1);
    }
  });
