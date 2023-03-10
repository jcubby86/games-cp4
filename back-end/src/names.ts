import { Router } from 'express';
import { NamesModel } from './models.js';
import { getAllEntries } from './utils.js';
import { shuffleArray, upperFirst } from './utils.js';

import male_names from './generation/male_names.js';
import female_names from './generation/female_names.js';
import { randomElement } from './generation/generationUtils.js';
import { joinPhase, loadNames, loadUser } from './middleware.js';
import { Entry, Game, NamesDocument, User } from './types.js';
import { END, PLAY, READ, WAIT } from './helpers/constants.js';

/**
 * Create a Names Document for a game.
 *
 * @export
 * @param {Game} game
 */
export async function createNames(game: Game) {
  const names = new NamesModel({
    game: game._id,
    entries: [],
  });
  await names.save();
}

/**
 * Check if all players have submitted an entry.
 *
 * @param {Game} game
 * @param {NamesDocument} names
 * @return {*}  {Promise<string[]>}
 */
async function checkCompletion(
  game: Game,
  names: NamesDocument
): Promise<string[]> {
  if (game.phase !== PLAY) return [];

  const createNamesEntry = (user: User): Entry<string> => ({
    user: user,
    value: '',
  });
  names.entries = await getAllEntries(game, names.entries, createNamesEntry);

  const waitingOnUsers = names.entries
    .filter((elem) => elem.value === '')
    .map((elem) => elem.user?.nickname);

  if (waitingOnUsers.length > 0) return waitingOnUsers;

  shuffleArray(names.entries);
  await names.save();

  game.phase = READ;
  await game.save();
  return [];
}

export const router = Router();
router.use(loadUser, loadNames);

/**
 * Get the state of the game.
 */
router.get('/', joinPhase, async (req, res) => {
  try {
    if (!req.game || !req.user || !req.names) return res.sendStatus(500);

    const names = req.names;
    const userId = req.user._id;
    const waitingOnUsers = await checkCompletion(req.game, names);

    if (req.game.phase === PLAY) {
      const userElem = names.entries.find((elem) =>
        elem.user._id.equals(userId)
      );

      const waiting = userElem?.value !== '';
      return res.send({
        phase: waiting ? WAIT : PLAY,
        users: waitingOnUsers,
        text: userElem?.value,
        placeholder: randomElement(randomElement([male_names, female_names])),
      });
    } else if (req.game.phase === READ) {
      return res.send({
        phase: READ,
        names: names.entries.map((elem) => elem.value),
      });
    } else {
      return res.send({
        phase: END,
      });
    }
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

/**
 * Save a user's entry.
 */
const quoteRegex = /["“”]/g;
router.put('/', async (req, res) => {
  if (!req.game || !req.user || !req.names) return res.sendStatus(500);

  if (req.game.phase !== PLAY) return res.sendStatus(403);

  const names = req.names;
  const userId = req.user._id;
  let statusCode = 200;

  let userIndex = names.entries.findIndex((elem) =>
    elem.user._id.equals(userId)
  );
  if (userIndex === -1) {
    statusCode = 201;
    userIndex = names.entries.length;
    names.entries.push({ user: req.user, value: '' });
  }

  const text = upperFirst(req.body.text.replaceAll(quoteRegex, '').trim());
  if (
    names.entries.find(
      (elem, index) =>
        elem.value.toLowerCase() === text.toLowerCase() && index != userIndex
    )
  ) {
    return res
      .status(400)
      .send(
        'That name has already been entered. Please choose something else!'
      );
  }

  names.entries[userIndex].value = text;

  await names.save();
  return res.sendStatus(statusCode);
});
