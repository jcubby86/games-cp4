import { Router } from 'express';

import { GamePhase } from './.generated/prisma';
import prisma from './client';
import { JoinGameReqBody as JoinReq, UserDto as User } from './domain/types.js';
import { loadUser } from './middleware.js';
import { ReqBody, ReqHandler } from './utils/types.js';

/**
 * Join a game.
 * If the user already has a session, we update the session/user
 * rather than creating a new one.
 */
const upsertUser: ReqHandler<JoinReq, User> = async (req, res, next) => {
  try {
    const game = await prisma.game.findUnique({
      where: { uuid: req.body.uuid },
    });
    if (
      !game ||
      !(game?.phase === GamePhase.JOIN || req.user?.gameId === game.id)
    ) {
      const error = `Game with code ${game?.code} does not exist or can no longer be joined.`;
      console.warn(error);
      return res.status(400).send({ error });
    }

    let statusCode = 201;
    if (!req.user) {
      req.user = await prisma.user.create({
        data: {
          nickname: req.body.nickname,
          game: {
            connect: {
              id: game.id,
            },
          },
        },
      });
      console.info('User created:', JSON.stringify(req.user));
    } else {
      req.user = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          nickname: req.body.nickname,
          game: {
            connect: {
              id: game.id,
            },
          },
        },
      });

      statusCode = 200;
    }
    req.game = game;

    req.session = {
      ...req.session,
      userID: req.user.uuid,
      nowInMinutes: Math.floor(Date.now() / 60e3), //refresh cookie so it won't expire for another 2 hours
    };

    if (!game.hostId) {
      await prisma.game.update({
        where: { id: game.id },
        data: { host: { connect: { id: req.user.id } } },
      });
    }

    res.status(statusCode).send({ ...req.user, game: req.game });
  } catch (err: unknown) {
    return next(err);
  }
};

const getUser: ReqHandler<ReqBody, User> = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(404);
    }
    res.send(req.user);
  } catch (err: unknown) {
    return next(err);
  }
};

const leaveGame: ReqHandler = async (req, res, next) => {
  try {
    if (req.user) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { game: { disconnect: true } },
      });
      if (req.game && req.game.hostId === req.user?.id) {
        const users = await prisma.user.findMany({
          where: { gameId: req.game.id },
        });
        if (users.length > 0) {
          await prisma.game.update({
            where: { id: req.game.id },
            data: { hostId: users[0].id },
          });
        } else {
          await prisma.game.update({
            where: { id: req.game.id },
            data: { host: { disconnect: true } },
          });
        }
      }
    }

    res.sendStatus(200);
  } catch (err: unknown) {
    return next(err);
  }
};

export const router = Router();
router.use(loadUser);
router.post('/', upsertUser);
router.get('/', getUser);
router.delete('/', leaveGame);
