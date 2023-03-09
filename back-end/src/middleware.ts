import { NamesModel, StoryModel, UserModel } from './models.js';
import { Game, NamesDocument, StoryDocument, User, Session } from './types.js';
import { gameExists, getUsersInGame } from './utils.js';
import type { Request, Response, NextFunction } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User | null | undefined;
      game?: Game | null | undefined;
      names?: NamesDocument | null | undefined;
      story?: StoryDocument | null | undefined;
      session?: Session | null | undefined;
    }
  }
}

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
  try {
    if (!req.session?.userID) return next();

    const user = await UserModel.findOne({ _id: req.session.userID }).populate(
      'game'
    );
    if (!user) return next();

    if (!user.game || !gameExists(user.game)) {
      user.game = undefined;
      await user.save();
    }

    req.user = user;
    req.game = user.game;
    next();
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
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
  if (req.game.type !== 'names') return res.sendStatus(400);

  req.names = await NamesModel.findOne({ game: req.game._id }).populate(
    'entries.user'
  );
  if (!req.names) return res.sendStatus(400);
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
  if (req.game.type !== 'story') return res.sendStatus(400);

  req.story = await StoryModel.findOne({ game: req.game._id }).populate(
    'entries.user'
  );
  if (!req.story) return res.sendStatus(400);
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
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.game?.phase === 'join') {
      const users = await getUsersInGame(req.game);
      return res.send({
        phase: 'join',
        users: users.map((user: User) => user.nickname),
        code: req.game.code,
        nickname: req.user?.nickname,
      });
    }

    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};
