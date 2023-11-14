import { Router } from 'express';

import { NamesReqBody, NamesResBody } from '../domain/types.js';
import SaveEntryError from '../errors/SaveEntryError';
import { joinPhase, loadNames, loadUser } from '../middleware.js';
import { getNameStatus, saveNameEntry } from '../models/names';
import {
  ReqBody as ReqBody,
  ReqHandler as ReqHandler,
} from '../utils/types.js';

const getGameHandler: ReqHandler<ReqBody, NamesResBody> = async (
  req,
  res,
  next
) => {
  try {
    if (!req.game || !req.user) return res.sendStatus(403);
    const response = await getNameStatus(req.user, req.game);
    return res.send(response);
  } catch (err: unknown) {
    return next(err);
  }
};

const saveEntryHandler: ReqHandler<NamesReqBody> = async (req, res, next) => {
  try {
    if (!req.user || !req.game) return res.sendStatus(403);
    await saveNameEntry(req.user, req.game, req.body.text);
    return res.sendStatus(200);
  } catch (err: unknown) {
    if (err instanceof SaveEntryError) {
      return res.sendStatus(400);
    }
    return next(err);
  }
};

const router = Router();
router.use(loadUser, loadNames);
router.get('/', joinPhase, getGameHandler);
router.put('/', saveEntryHandler);
export default router;
