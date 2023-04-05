import { SuggestionModel } from "../models";
import { Suggestion } from "../types";

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



export async function getSuggestion(category: string): Promise<string> {
  const suggestions: Suggestion[] = await SuggestionModel.find({
    category: category,
  });
  return randomElement(suggestions.map((x) => x.value));
}