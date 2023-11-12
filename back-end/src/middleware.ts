import { GamePhase, GameType, User } from './.generated/prisma';
import prisma from './client';
import { JoinResBody as JoinRes } from './domain/types.js';
import { ReqHandler as Handler, ReqBody as ReqBody } from './utils/types.js';

/**
 * Middleware for loading in a user from the session.
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const loadUser: Handler = async (req, res, next) => {
  try {
    if (!req.session?.userID) return next();

    const user = await prisma.user.findUnique({
      where: { uuid: req.session.userID },
      include: { game: true },
    });

    if (!user) return next();

    req.user = user;
    req.game = user.game ?? undefined;
    return next();
  } catch (err: unknown) {
    return next(err);
  }
};

/**
 * Middleware for handling a game if it's in the join phase.
 * Used by Story and Names types.
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const joinPhase: Handler<ReqBody, JoinRes> = async (req, res, next) => {
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

    return next();
  } catch (err: unknown) {
    return next(err);
  }
};

/**
 * Middleware for loading in the Names Document.
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const loadNames: Handler = async (req, res, next) => {
  if (!req.user || !req.game) return res.sendStatus(403);
  if (req.game.type !== GameType.NAME) return res.sendStatus(400);
  return next();
};

/**
 * Middleware for loading in the Story Document.
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const loadStory: Handler = async (req, res, next) => {
  if (!req.user || !req.game) return res.sendStatus(403);
  if (req.game.type !== GameType.STORY) return res.sendStatus(400);
  return next();
};

/**
 * Middleware that logs incoming http requests
 * @param req
 * @param res
 * @param next
 */
export const accessLogger: Handler = async (req, res, next) => {
  res.on('finish', () => {
    if (req.originalUrl.endsWith('/health')) return;
    console.log(
      `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${
        res.statusCode
      }`
    );
  });
  return next();
};
