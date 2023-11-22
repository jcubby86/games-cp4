import { Router } from 'express';

import SaveEntryError from '../errors/SaveEntryError';
import { joinPhaseHandler, loadNames, loadPlayer } from '../middleware.js';
import { getNameStatus, saveNameEntry } from '../models/names';
import { EntryReqBody, NamesResBody, ReqBody } from '../types/domain.js';
import { ReqHandler } from '../types/express.js';

const getGameHandler: ReqHandler<ReqBody, NamesResBody> = async (
  req,
  res,
  next
) => {
  try {
    if (!req.game || !req.player) return res.sendStatus(403);
    const response = await getNameStatus(req.player, req.game);
    return res.send(response);
  } catch (err: unknown) {
    return next(err);
  }
};

const saveEntryHandler: ReqHandler<EntryReqBody> = async (req, res, next) => {
  try {
    if (!req.player || !req.game) return res.sendStatus(403);
    await saveNameEntry(req.player, req.game, req.body.value);
    return res.sendStatus(200);
  } catch (err: unknown) {
    if (err instanceof SaveEntryError) {
      return res.status(400).send({ error: err.message });
    }
    return next(err);
  }
};

const router = Router();
router.use(loadPlayer, loadNames);
router.get('/', joinPhaseHandler, getGameHandler);
router.put('/', saveEntryHandler);
export default router;
