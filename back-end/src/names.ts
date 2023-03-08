import { Router, Request } from 'express';
import { NamesModel } from './models.js';
import { getAllSubmissions } from './utils.js';
import { shuffleArray, upperFirst } from './utils.js';

import male_names from './generation/male_names.js';
import female_names from './generation/female_names.js';
import { randomElement } from './generation/generationUtils.js';
import { joinPhase, loadNames, loadUser } from './middleware.js';
import {
  StringEntry,
  GameDocument,
  NamesDocument,
  UserDocument,
} from './types.js';

export const createNames = async (game: GameDocument) => {
  const names = new NamesModel({
    game: game._id,
    names: [],
  });
  await names.save();
};

const checkCompletion = async (
  game: GameDocument,
  namesType: NamesDocument
) => {
  if (game.phase !== 'play') return [];

  const userToName = (user: UserDocument): StringEntry => ({
    user: user,
    text: '',
  });
  namesType.names = await getAllSubmissions(game, namesType.names, userToName);

  const waitingOnUsers = namesType.names
    .filter((elem) => elem.text === '')
    .map((elem) => elem.user?.nickname);

  if (waitingOnUsers.length > 0) return waitingOnUsers;

  shuffleArray(namesType.names);
  await namesType.save();

  game.phase = 'read';
  await game.save();
  return [];
};

export const router = Router();
router.use(loadUser, loadNames);

router.get('/', joinPhase, async (req: Request, res) => {
  try {
    if (!req.game || !req.user || !req.namesType) return res.sendStatus(500);

    const namesType = req.namesType;
    const userId = req.user._id;
    const waitingOnUsers = await checkCompletion(req.game, namesType);

    if (req.game.phase === 'play') {
      const userElem = namesType.names.find((elem) =>
        elem.user._id.equals(userId)
      );

      const waiting = userElem?.text !== '';
      return res.send({
        phase: waiting ? 'wait' : 'play',
        users: waitingOnUsers,
        text: userElem?.text,
        placeholder: randomElement(randomElement([male_names, female_names])),
      });
    } else if (req.game.phase === 'read') {
      return res.send({
        phase: 'read',
        names: namesType.names.map((elem) => elem.text),
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
  if (!req.game || !req.user || !req.namesType) return res.sendStatus(500);

  if (req.game.phase !== 'play') return res.sendStatus(403);

  const namesType = req.namesType;
  const userId = req.user._id;
  let statusCode = 200;

  let userIndex = namesType.names.findIndex((elem) =>
    elem.user._id.equals(userId)
  );
  if (userIndex === -1) {
    statusCode = 201;
    userIndex = namesType.names.length;
    namesType.names.push({ user: req.user, text: '' });
  }

  const text = upperFirst(req.body.text.replaceAll(quoteRegex, '').trim());
  if (
    namesType.names.find(
      (elem, index) =>
        elem.text.toLowerCase() === text.toLowerCase() && index != userIndex
    )
  ) {
    return res
      .status(400)
      .send(
        'That name has already been entered. Please choose something else!'
      );
  }

  namesType.names[userIndex].text = text;

  await namesType.save();
  return res.sendStatus(statusCode);
});
