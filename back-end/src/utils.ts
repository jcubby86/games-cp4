import { UserModel } from './models';
import { Entry, Game, User } from './types';

export const shuffleArray = (array: unknown[]) => {
  let curId = array.length;

  while (curId) {
    const randId = Math.floor(Math.random() * curId);
    curId -= 1;
    const tmp = array[curId];
    array[curId] = array[randId];
    array[randId] = tmp;
  }
};

export const lowerFirst = (part: string) => {
  return part.slice(0, 1).toLowerCase() + part.slice(1);
};

export const upperFirst = (part: string) => {
  return part.slice(0, 1).toUpperCase() + part.slice(1);
};

export async function getAllEntries<Type>(
  game: Game,
  entries: Entry<Type>[],
  // eslint-disable-next-line no-unused-vars
  createEntry: (user: User) => Entry<Type>
) {
  if (game.phase !== 'play') return [];

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

export const gameExists = (game: Game) => {
  return new Date().getTime() - 2 * 60 * 60 * 1000 < game.createdAt.getTime();
};

export const getUsersInGame = async (game: Game) => {
  const users = await UserModel.find({ game: game._id });
  return users;
};
