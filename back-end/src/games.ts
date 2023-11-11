import { Router } from 'express';

import { GamePhase, GameType, User } from './.generated/prisma';
import {
  CreateGameReqBody as CreateReq,
  GameDto as Game,
  UpdateGameReqBody as UpdateReq,
} from './domain/types.js';
import prisma from './server.js';
import { ReqBody, ReqHandler as ReqHandler } from './utils/types.js';

/**
 * Generate a 4 letter string as game code,
 * and make sure that it is not already in use.
 *
 * @return {string}
 */
function getCode(): string {
  //TODO: check to make sure the code isn't used
  const c = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substring(0, 4);
  return c;
}

function getGameType(s: string): GameType {
  return s.toUpperCase() as GameType;
}

function getGamePhase(s: string): GamePhase {
  return s.toUpperCase() as GamePhase;
}

function getGameTitle(type: GameType): string | undefined {
  if (type === GameType.STORY) {
    return 'He Said She Said';
  } else if (type === GameType.NAME) {
    return 'The Name Game';
  } else {
    return undefined;
  }
}

const createGame: ReqHandler<CreateReq, Game> = async (req, res, next) => {
  try {
    const game = await prisma.game.create({
      data: {
        code: getCode(),
        type: getGameType(req.body.type),
      },
    });

    console.info('Game created:', JSON.stringify(game));
    return res.status(201).send({ ...game, title: getGameTitle(game.type) });
  } catch (err: unknown) {
    return next(err);
  }
};

const getGame: ReqHandler<ReqBody, Game> = async (req, res, next) => {
  try {
    const game = await prisma.game.findUniqueOrThrow({
      where: { code: req.params.code },
    });

    return res.send({ ...game, title: getGameTitle(game.type) });
  } catch (err: unknown) {
    return next(err);
  }
};

const updateGamePhase: ReqHandler<UpdateReq, Game> = async (req, res, next) => {
  try {
    const game = await prisma.game.update({
      where: { uuid: req.params.uuid },
      data: { phase: getGamePhase(req.body.phase) },
    });
    if (!game) return res.sendStatus(404);

    console.info('Game updated:', JSON.stringify(game));
    return res.send(game);
  } catch (err: unknown) {
    return next(err);
  }
};

const getUsers: ReqHandler<ReqBody, User[]> = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        game: {
          uuid: req.params.uuid,
        },
      },
    });
    return res.send(users);
  } catch (err: unknown) {
    return next(err);
  }
};

const recreateGame: ReqHandler<ReqBody, Game> = async (req, res, next) => {
  try {
    const oldGame = await prisma.game.findUniqueOrThrow({
      where: {
        uuid: req.params.uuid,
      },
      include: {
        successor: true,
      },
    });
    if (oldGame.successor) {
      return res.send(oldGame.successor);
    } else {
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
    }
  } catch (err: unknown) {
    return next(err);
  }
};

export const router = Router();
router.post('/', createGame);
router.get('/:code', getGame);
router.put('/:uuid', updateGamePhase);
router.get('/:uuid/users', getUsers);
router.post('/:uuid/recreate', recreateGame);
