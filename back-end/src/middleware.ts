import { GameType } from './.generated/prisma';
import { joinPhase } from './models/games';
import { getUser } from './models/users';
import { JoinResBody, ReqBody } from './types/domain.js';
import { ReqHandler as Handler } from './types/express.js';

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

    const user = await getUser(req.session.userID);

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
export const joinPhaseHandler: Handler<ReqBody, JoinResBody> = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user || !req.game) return res.sendStatus(403);
    const response = await joinPhase(req.user, req.game);
    if (response) return res.send(response);
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
