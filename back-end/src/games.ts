import { Router } from 'express';
import { GameModel } from './models.js';
import { createStory } from './story.js';
import { createNames } from './names.js';
import { CreateGameFunction, Game } from './types';

export const router = Router();

const validGameTypes: { [key: string]: CreateGameFunction } = {
  story: createStory,
  names: createNames,
};
const gameTitles: { [key: string]: string } = {
  story: 'He Said She Said',
  names: 'The Name Game',
};

const getCode = async () => {
  while (true) {
    const c = Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substring(0, 4);
    const search = await GameModel.findOne({ code: c });
    if (!search) {
      return c;
    }
  }
};

router.post('/', async (req, res) => {
  try {
    const createType: CreateGameFunction = validGameTypes[req.body.type];

    if (!createType) {
      console.warn(`Invalid game type: ${req.body.type}`);
      return res.status(400).send(`Invalid game type: ${req.body.type}`);
    }

    const newCode = await getCode();
    const game: Game = new GameModel({
      type: req.body.type,
      code: newCode,
      phase: 'join',
    });

    await game.save();
    createType(game);
    console.info('Game created:', JSON.stringify(game));
    return res.status(201).send(game);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.get('/:code', async (req, res) => {
  try {
    const game = await GameModel.findOne({ code: req.params.code });
    if (!game) {
      return res.sendStatus(404);
    }

    res.send({ ...game, title: gameTitles[game.type] });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.put('/:code', async (req, res) => {
  try {
    const game = await GameModel.findOne({ code: req.params.code });
    if (!game) {
      return res.sendStatus(404);
    }

    game.phase = req.body.phase;
    await game.save();

    console.info('Game updated:', JSON.stringify(game));
    res.send(game);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});
