import { Router } from 'express';

import SaveEntryError from '../errors/SaveEntryError';
import { joinPhaseHandler, loadStory, loadUser } from '../middleware.js';
import {
  getStoryArchive,
  getStoryStatus,
  saveStoryEntry
} from '../models/story';
import {
  EntryReqBody,
  ReqBody,
  StoryArchiveResBody,
  StoryResBody
} from '../types/domain.js';
import { ReqHandler as Handler } from '../types/express.js';

const getGameHandler: Handler<ReqBody, StoryResBody> = async (
  req,
  res,
  next
) => {
  try {
    if (!req.game || !req.user) return res.sendStatus(403);
    const response = await getStoryStatus(req.user, req.game);
    return res.send(response);
  } catch (err: unknown) {
    return next(err);
  }
};

const saveEntryHandler: Handler<EntryReqBody> = async (req, res, next) => {
  try {
    if (!req.game || !req.user) return res.sendStatus(403);
    await saveStoryEntry(req.user, req.game, req.body.value);
    return res.sendStatus(200);
  } catch (err: unknown) {
    if (err instanceof SaveEntryError) {
      return res.status(400).send({ error: err.message });
    }
    return next(err);
  }
};

const getArchiveHandler: Handler<ReqBody, StoryArchiveResBody> = async (
  req,
  res,
  next
) => {
  try {
    const entries = await getStoryArchive(req.params.uuid);

    if (!entries) return res.status(404);

    return res.send({
      stories: entries.map((entry) => ({
        value: entry.finalValue,
        user: { nickname: entry.user.nickname, id: entry.user.uuid }
      }))
    });
  } catch (err: unknown) {
    return next(err);
  }
};

const router = Router();
router.get('/:uuid', getArchiveHandler);
router.use(loadUser, loadStory);
router.get('/', joinPhaseHandler, getGameHandler);
router.put('/', saveEntryHandler);
export default router;
