/**
 * Generate a random number between 0 and the limit, exclusive.
 *
 * @param limit
 * @returns
 */
export function randomNumber(limit: number) {
  return Math.floor(Math.random() * limit);
}

/**
 * Retrieve a random element from the array.
 *
 * @param arr
 * @returns
 */
export function randomElement<Type>(arr: Type[]): Type {
  return arr[randomNumber(arr.length)];
}

/**
 * Randomly reorder an array in place.
 *
 * @export
 * @template Type
 * @param {Type[]} array
 */
export function shuffleArray<Type>(array: Type[]): void {
  let curId = array.length;

  while (curId) {
    const randId = Math.floor(Math.random() * curId);
    curId -= 1;
    const tmp = array[curId];
    array[curId] = array[randId];
    array[randId] = tmp;
  }
}

/**
 * Change the first letter of the string to lowercase.
 * Preserves the rest of the string.
 *
 * @export
 * @param {string} part
 * @return {*}  {string}
 */
export function lowerFirst(part: string): string {
  return part.slice(0, 1).toLowerCase() + part.slice(1);
}

/**
 * Change the first letter of the string to uppercase.
 * Preserves the rest of the string.
 *
 * @export
 * @param {string} part
 * @return {*}  {string}
 */
export function upperFirst(part: string): string {
  return part.slice(0, 1).toUpperCase() + part.slice(1);
}
