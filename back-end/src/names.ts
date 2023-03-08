import { Router, Request } from 'express';
import { NamesModel } from './models.js';
import { getAllEntries } from './utils.js';
import { shuffleArray, upperFirst } from './utils.js';

import male_names from './generation/male_names.js';
import female_names from './generation/female_names.js';
import { randomElement } from './generation/generationUtils.js';
import { joinPhase, loadNames, loadUser } from './middleware.js';
import { Entry, Game, NamesDocument, User } from './types.js';

export const createNames = async (game: Game) => {
  const names = new NamesModel({
    game: game._id,
    entries: [],
  });
  await names.save();
};

const checkCompletion = async (game: Game, names: NamesDocument) => {
  if (game.phase !== 'play') return [];

  const userToName = (user: User): Entry<string> => ({
    user: user,
    value: '',
  });
  names.entries = await getAllEntries(game, names.entries, userToName);

  const waitingOnUsers = names.entries
    .filter((elem) => elem.value === '')
    .map((elem) => elem.user?.nickname);

  if (waitingOnUsers.length > 0) return waitingOnUsers;

  shuffleArray(names.entries);
  await names.save();

  game.phase = 'read';
  await game.save();
  return [];
};

export const router = Router();
router.use(loadUser, loadNames);

router.get('/', joinPhase, async (req: Request, res) => {
  try {
    if (!req.game || !req.user || !req.names) return res.sendStatus(500);

    const names = req.names;
    const userId = req.user._id;
    const waitingOnUsers = await checkCompletion(req.game, names);

    if (req.game.phase === 'play') {
      const userElem = names.entries.find((elem) =>
        elem.user._id.equals(userId)
      );

      const waiting = userElem?.value !== '';
      return res.send({
        phase: waiting ? 'wait' : 'play',
        users: waitingOnUsers,
        text: userElem?.value,
        placeholder: randomElement(randomElement([male_names, female_names])),
      });
    } else if (req.game.phase === 'read') {
      return res.send({
        phase: 'read',
        names: names.entries.map((elem) => elem.value),
      });
    } else {
      return res.send({
        phase: 'end',
      });
    }
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

const quoteRegex = /["“”]/g;
router.put('/', async (req: Request, res) => {
  if (!req.game || !req.user || !req.names) return res.sendStatus(500);

  if (req.game.phase !== 'play') return res.sendStatus(403);

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
