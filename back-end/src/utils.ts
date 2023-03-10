import { PLAY } from './helpers/constants';
import { UserModel } from './models';
import { Entry, Game, User } from './types';

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
 * Get all entries for all users in a game.
 * Clears out entries for users that have left,
 * and adds entries for those who do not have one yet.
 *
 * @export
 * @template Type
 * @param {Game} game
 * @param {Entry<Type>[]} entries
 * @param {(user: User) => Entry<Type>} createEntry
 * @return {*}  {Promise<Entry<Type>[]>}
 */
export async function getAllEntries<Type>(
  game: Game,
  entries: Entry<Type>[],
  // eslint-disable-next-line no-unused-vars
  createEntry: (user: User) => Entry<Type>
): Promise<Entry<Type>[]> {
  if (game.phase !== PLAY) return [];

  const users = await getUsersInGame(game);

  const allUsers = new Set(users.map((user) => user._id.valueOf()));
  const usersWithEntries = new Set(
    entries.map((item) => item.user._id.valueOf())
  );

  const filteredEntries = entries.filter((elem) =>
    allUsers.has(elem.user._id.valueOf())
  );
  const newEntries = users
    .filter((user) => !usersWithEntries.has(user._id.valueOf()))
    .map(createEntry);

  return [...filteredEntries, ...newEntries];
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

/**
 * Get all the users in a game.
 *
 * @export
 * @param {Game} game
 * @return {*}  {Promise<User[]>}
 */
export async function getUsersInGame(game: Game): Promise<User[]> {
  return await UserModel.find({ game: game._id });
}
