import { Category, Suggestion } from '../.generated/prisma';
import prisma from '../prisma';
import { randomElement } from '../utils/utils';

export async function getSuggestion(category: Category): Promise<string> {
  const suggestions: Suggestion[] = await prisma.suggestion.findMany({
    where: { category },
  });
  return randomElement(suggestions.map((x) => x.value));
}
