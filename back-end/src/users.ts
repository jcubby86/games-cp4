import { Router } from 'express';
import prisma from './server.js';
import { GamePhase } from './.generated/prisma';
import { loadUser } from './middleware.js';
import { JoinGameRequestBody, Middleware, RequestBody, User } from './types.js';

/**
 * Join a game.
 * If the user already has a session, we update the session/user
 * rather than creating a new one.
 */
const upsertUser: Middleware<JoinGameRequestBody, User> = async (
  req,
  res,
  next
) => {
  try {
    const game = await prisma.game.findUnique({
      where: { code: req.body.code },
    });
    if (
      !game ||
      !(game?.phase === GamePhase.JOIN || req.user?.gameId === game.id)
    ) {
      console.warn(
        `Game with code ${req.body.code} does not exist or can no longer be joined.`
      );
      return res.status(400).send({
        error: `Game with code ${req.body.code} does not exist or can no longer be joined.`,
      });
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
  } catch (err) {
    return next(err);
  }
};

const getUser: Middleware<RequestBody, User> = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(404);
    }
    res.send(req.user);
  } catch (err) {
    return next(err);
  }
};

const leaveGame: Middleware = async (req, res, next) => {
  try {
    const game = req.game;

    if (req.user) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { game: { disconnect: true } },
      });
    }
    if (game !== null && game !== undefined && game.hostId === req.user?.id) {
      const users = await prisma.user.findMany({
        where: { gameId: game.id },
      });
      if (users.length > 0) {
        await prisma.game.update({
          where: { id: game.id },
          data: { host: { connect: { id: users[0].id } } },
        });
      } else {
        await prisma.game.update({
          where: { id: game.id },
          data: { host: { disconnect: true } },
        });
      }
    }

    res.sendStatus(200);
  } catch (err) {
    return next(err);
  }
};

export const router = Router();
router.post('/', loadUser, upsertUser);
router.get('/', loadUser, getUser);
router.delete('/', loadUser, leaveGame);
