import { Router, Request, Response } from 'express';
import {
  Params,
  PostGameReqBody,
  UpdateGameReqBody,
  Game,
} from './types';
import prisma from './server.js';
import { Prisma, GameType, GamePhase, User } from '@prisma/client';

export const router = Router();

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
function getCode(): string {
  //TODO: check to make sure the code isn't used
  const c = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substring(0, 4);
  return c;
}

/**
 *
 */
function getGameType(s: string): GameType {
  return s.toUpperCase() as GameType;
}

/**
 *
 */
function getGamePhase(s: string): GamePhase {
  return s.toUpperCase() as GamePhase;
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
      const game = await prisma.game.create({
        data: {
          code: getCode(),
          type: getGameType(req.body.type),
        },
      });
    
      console.info('Game created:', JSON.stringify(game));
      return res.status(201).send({ ...game, title: gameTitles[game.type] });
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }
);

/**
 * Get a Game object and title.
 */
router.get(
  '/:code',
  async (req: Request<Params>, res: Response<Game>) => {
    const game = await prisma.game.findUnique({
      where: { code: req.params.code },
    });
    if (!game) return res.sendStatus(404);

    return res.send({ ...game, title: gameTitles[game.type] });
  }
);

/**
 * Update the phase of a Game.
 */
router.put(
  '/:code',
  async (
    req: Request<Params, unknown, UpdateGameReqBody>,
    res: Response<Game>
  ) => {
    const game = await prisma.game.update({
      where: { code: req.params.code },
      data: { phase: getGamePhase(req.body.phase) },
    });
    if (!game) return res.sendStatus(404);

    console.info('Game updated:', JSON.stringify(game));
    res.send(game);
  }
);

/**
 * Get all the users in a game.
 */
router.get(
  '/:code/users',
  async (req: Request<Params, unknown, unknown>, res: Response<User[]>) => {
    const users = await prisma.user.findMany({
      where: {
        game: {
          code: req.params.code,
        },
      },
    });
    return res.send(users);
  }
);

/**
 * Create a new game/join a game that was created
 */
router.post(
  '/:code/recreate',
  async (
    req: Request<Params, unknown, unknown>,
    res: Response<Game>
  ) => {
    try {
      const oldGame = await prisma.game.findUniqueOrThrow({
        where: {
          code: req.params.code,
        },
        include: {
          successor: true,
        },
      });
      if (oldGame.successor) {
        return res.send(oldGame.successor);
      }

      const newGame = await prisma.game.create({
        data: {
          code: getCode(),
          type: oldGame.type,
          predecessor: {
            connect: {
              id: oldGame.id,
            },
          },
        },
      });
      return res.send(newGame);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        return res.sendStatus(404);
      }
      console.error(err);
      return res.sendStatus(500);
    }
  }
);
