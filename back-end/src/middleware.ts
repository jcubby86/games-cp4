import { NamesModel, StoryModel, UserModel } from './models.js';
import {
  GameDocument,
  NamesDocument,
  StoryDocument,
  UserDocument,
  Session,
} from './types.js';
import { gameExists, getUsersInGame } from './utils.js';
import type { Request, Response, NextFunction } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserDocument | null | undefined;
      game?: GameDocument | null | undefined;
      namesType?: NamesDocument | null | undefined;
      storyType?: StoryDocument | null | undefined;
      session?: Session | null | undefined;
    }
  }
}

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

export const loadNames = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.game) return res.sendStatus(401);
  if (req.game.type !== 'names') return res.sendStatus(400);

  req.namesType = await NamesModel.findOne({ game: req.game._id }).populate(
    'names.user'
  );
  if (!req.namesType) return res.sendStatus(400);
  next();
};

export const loadStory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.game) return res.sendStatus(401);
  if (req.game.type !== 'story') return res.sendStatus(400);

  req.storyType = await StoryModel.findOne({ game: req.game._id }).populate(
    'stories.user'
  );
  if (!req.storyType) return res.sendStatus(400);
  next();
};

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
        users: users.map((user: UserDocument) => user.nickname),
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
