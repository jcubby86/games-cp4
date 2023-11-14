import { Router } from 'express';

import {
  JoinGameReqBody as JoinReq,
  UserDto as User,
} from '../domain/types.js';
import CannotJoinGameError from '../errors/CannotJoinGameError.js';
import { loadUser } from '../middleware.js';
import { leaveGame, upsertUser } from '../models/users';
import { ReqBody, ReqHandler } from '../utils/types.js';

/**
 * Join a game.
 * If the user already has a session, we update the session/user
 * rather than creating a new one.
 */
const upsertUserHandler: ReqHandler<JoinReq, User> = async (req, res, next) => {
  try {
    req.user = await upsertUser(req.user, req.body.uuid, req.body.nickname);

    req.session = {
      ...req.session,
      userID: req.user.uuid,
      nowInMinutes: Math.floor(Date.now() / 60e3), //refresh cookie so it won't expire for another 2 hours
    };

    res.send({ ...req.user, game: req.game });
  } catch (err: unknown) {
    if (err instanceof CannotJoinGameError) {
      return res.status(400).send({ error: err.message });
    }
    return next(err);
  }
};

const getUserHandler: ReqHandler<ReqBody, User> = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(404);
    }
    res.send(req.user);
  } catch (err: unknown) {
    return next(err);
  }
};

const leaveGameHandler: ReqHandler = async (req, res, next) => {
  try {
    await leaveGame(req.user);

    res.sendStatus(200);
  } catch (err: unknown) {
    return next(err);
  }
};

const router = Router();
router.use(loadUser);
router.post('/', upsertUserHandler);
router.get('/', getUserHandler);
router.delete('/', leaveGameHandler);
export default router;
