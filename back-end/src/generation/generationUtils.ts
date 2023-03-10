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
