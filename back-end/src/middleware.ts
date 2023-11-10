import { JoinResBody } from './types.js';
import type { Request, Response, NextFunction } from 'express';
import prisma from './server.js';
import { User, GamePhase, GameType } from './.generated/prisma';

/**
 * Middleware for loading in a user from the session.
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const loadUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.userID) return next();

  const user = await prisma.user.findUnique({
    where: { uuid: req.session.userID },
    include: { game: true },
  });

  if (!user) return next();

  req.user = user;
  req.game = user.game;
  next();
};

/**
 * Middleware for handling a game if it's in the join phase.
 * Used by Story and Names types.
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const joinPhase = async (
  req: Request,
  res: Response<JoinResBody>,
  next: NextFunction
) => {
  try {
    if (req.game?.phase === GamePhase.JOIN) {
      const users = await prisma.user.findMany({
        where: {
          game: {
            id: req.game.id,
          },
        },
      });
      return res.send({
        phase: GamePhase.JOIN,
        users: users.map((user: User) => user.nickname),
        code: req.game.code,
        nickname: req.user?.nickname,
        isHost: req.game.hostId === req.user?.id,
      });
    }

    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

/**
 * Middleware for loading in the Names Document.
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const loadNames = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.game) return res.sendStatus(401);
  if (req.game.type !== GameType.NAME) return res.sendStatus(400);

  req.nameEntries = await prisma.nameEntry.findMany({
    where: { gameId: req.game.id, user: { gameId: req.game.id } },
  });

  if (!req.nameEntries) return res.sendStatus(400);
  next();
};

/**
 * Middleware for loading in the Story Document.
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const loadStory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.game) return res.sendStatus(401);
  if (req.game.type !== GameType.STORY) return res.sendStatus(400);

  req.storyEntries = await prisma.storyEntry.findMany({
    where: { gameId: req.game.id, user: { gameId: req.game.id } },
  });
  if (!req.storyEntries) return res.sendStatus(400);
  next();
};

/**
 * Middleware that logs incoming http requests
 * @param req 
 * @param res 
 * @param next 
 */
export const accessLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.on('finish', () => {
    if (req.originalUrl.endsWith('/health')) return;
    console.log(
      `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${
        res.statusCode
      }`
    );
  });
  next();
};
