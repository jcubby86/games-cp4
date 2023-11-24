import { Router } from 'express';

import CannotJoinGameError from '../errors/CannotJoinGameError.js';
import { loadPlayer } from '../middleware.js';
import { leaveGame, upsertPlayer } from '../models/players.js';
import { JoinGameReqBody, PlayerDto, ReqBody } from '../types/domain.js';
import { ReqHandler } from '../types/express.js';

/**
 * Join a game.
 * If the player already has a session, we update the session/player
 * rather than creating a new one.
 */
const upsertPlayerHandler: ReqHandler<JoinGameReqBody, PlayerDto> = async (
  req,
  res,
  next
) => {
  try {
    req.player = await upsertPlayer(
      req.player,
      req.body.uuid,
      req.body.nickname.toLowerCase()
    );

    req.session = {
      ...req.session,
      playerId: req.player.uuid
    };

    res.send({ ...req.player });
  } catch (err: unknown) {
    if (err instanceof CannotJoinGameError) {
      return res.status(400).send({ error: err.message });
    }
    return next(err);
  }
};

const getPlayerHandler: ReqHandler<ReqBody, PlayerDto> = async (
  req,
  res,
  next
) => {
  try {
    if (!req.player) {
      return res.sendStatus(404);
    }
    res.send(req.player);
  } catch (err: unknown) {
    return next(err);
  }
};

const leaveGameHandler: ReqHandler = async (req, res, next) => {
  try {
    await leaveGame(req.player);

    res.sendStatus(200);
  } catch (err: unknown) {
    return next(err);
  }
};

const router = Router();
router.use(loadPlayer);
router.post('/', upsertPlayerHandler);
router.get('/', getPlayerHandler);
router.delete('/', leaveGameHandler);
export default router;
