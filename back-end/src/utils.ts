import prisma from './server';
import { Game } from './.generated/prisma';

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

/**
 * Check if the game has ended.
 *
 * @export
 * @param {Game} game
 * @return {*}  {boolean}
 */
export function gameExists(game: Game): boolean {
  //               hr  min  sec  millis
  const twoHours = 2 * 60 * 60 * 1000;
  return new Date().getTime() - twoHours < game.createdAt.getTime();
}

export async function getUsersByGameId(gameId: number) {
  return prisma.user.findMany({
    where: { gameId: gameId },
  });
}

export function getEntryForGame<E extends { gameId: number }>(
  gameId: number,
  entries: E[]
): E | undefined {
  return entries.find((e) => e.gameId === gameId);
}
