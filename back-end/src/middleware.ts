import { GameType } from './.generated/prisma';
import { joinPhase } from './models/games';
import { getPlayer } from './models/players';
import { GameStatusResBody, ReqBody } from './types/domain.js';
import { ReqHandler as Handler } from './types/express.js';

export const loadPlayer: Handler = async (req, res, next) => {
  try {
    if (!req.session?.playerId) return next();

    const player = await getPlayer(req.session.playerId);

    if (!player) return next();

    req.player = player;
    req.game = player.game ?? undefined;
    return next();
  } catch (err: unknown) {
    return next(err);
  }
};

export const joinPhaseHandler: Handler<ReqBody, GameStatusResBody> = async (
  req,
  res,
  next
) => {
  try {
    if (!req.player || !req.game) return res.sendStatus(403);
    const response = await joinPhase(req.player, req.game);
    if (response) return res.send(response);
    return next();
  } catch (err: unknown) {
    return next(err);
  }
};

export const loadNames: Handler = async (req, res, next) => {
  if (!req.player || !req.game) return res.sendStatus(403);
  if (req.game.type !== GameType.NAME) return res.sendStatus(400);
  return next();
};

export const loadStory: Handler = async (req, res, next) => {
  if (!req.player || !req.game) return res.sendStatus(403);
  if (req.game.type !== GameType.STORY) return res.sendStatus(400);
  return next();
};
