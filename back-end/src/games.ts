import { Router, Request, Response } from 'express';
import { GameModel } from './models.js';
import { createStory } from './story.js';
import { createNames } from './names.js';
import {
  CreateGameFunction,
  Game,
  User,
  Params,
  PostGameReqBody,
  UpdateGameReqBody,
} from './types';
import { getUsersInGame } from './utils.js';
import { JOIN } from './helpers/constants.js';

export const router = Router();

const validGameTypes: { [key: string]: CreateGameFunction } = {
  story: createStory,
  names: createNames,
};
const gameTitles: { [key: string]: string } = {
  story: 'He Said She Said',
  names: 'The Name Game',
};

/**
 * Generate a 4 letter string as game code,
 * and make sure that it is not already in use.
 *
 * @return {*}  {Promise<string>}
 */
async function getCode(): Promise<string> {
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
}

/**
 * Create a new Game.
 */
router.post(
  '/',
  async (
    req: Request<unknown, unknown, PostGameReqBody>,
    res: Response<Game>
  ) => {
    try {
      const createType: CreateGameFunction = validGameTypes[req.body.type];

      if (!createType) {
        console.warn(`Invalid game type: ${req.body.type}`);
        return res.sendStatus(400);
      }

      const newCode = await getCode();
      const game: Game = new GameModel({
        type: req.body.type,
        code: newCode,
        phase: JOIN,
      });

      await game.save();
      createType(game);
      console.info('Game created:', JSON.stringify(game));
      return res.status(201).send(game);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }
);

/**
 * Get a Game object and title.
 */
router.get('/:code', async (req: Request<Params>, res: Response<Game>) => {
  try {
    const game: Game | null = await GameModel.findOne({
      code: req.params.code,
    });
    if (!game) {
      return res.sendStatus(404);
    }
    game.title = gameTitles[game.type];

    res.send(game);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

/**
 * Update the phase of a Game.
 */
router.put(
  '/:code',
  async (
    req: Request<Params, unknown, UpdateGameReqBody>,
    res: Response<Game>
  ) => {
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
  }
);

/**
 * Get all the users in a game.
 */
router.get(
  '/:code/users',
  async (req: Request<Params, unknown, unknown>, res: Response<User[]>) => {
    try {
      const game = await GameModel.findOne({ code: req.params.code });
      if (!game) return res.sendStatus(404);
      const users = await getUsersInGame(game);
      res.send(users);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }
);
