import prisma from '../server';
import { Suggestion, Category } from '../.generated/prisma';

/**
 * Generate a random number between 0 and the limit, exclusive.
 *
 * @param limit
 * @returns
 */
export const randomNumber = (limit: number) =>
  Math.floor(Math.random() * limit);

/**
 * Retrieve a random element from the array.
 *
 * @param arr
 * @returns
 */
export function randomElement<Type>(arr: Type[]): Type {
  return arr[randomNumber(arr.length)];
}

export async function getSuggestion(category: Category): Promise<string> {
  const suggestions: Suggestion[] = await prisma.suggestion.findMany({
    where: { category },
  });
  return randomElement(suggestions.map((x) => x.value));
}
