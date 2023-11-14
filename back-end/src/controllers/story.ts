import { Router } from 'express';

import {
  StoryArchiveResBody,
  StoryReqBody,
  StoryResBody,
} from '../domain/types.js';
import SaveEntryError from '../errors/SaveEntryError';
import { joinPhase, loadStory, loadUser } from '../middleware.js';
import {
  getStoryArchive,
  getStoryStatus,
  saveStoryEntry,
} from '../models/story';
import { ReqHandler as Handler, ReqBody as ReqBody } from '../utils/types.js';

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

const saveEntryHandler: Handler<StoryReqBody> = async (req, res, next) => {
  try {
    if (!req.game || !req.user) return res.sendStatus(403);
    await saveStoryEntry(req.user, req.game, req.body.part);
    return res.sendStatus(200);
  } catch (err: unknown) {
    if (err instanceof SaveEntryError) {
      return res.sendStatus(400);
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
    const entries = await getStoryArchive(req.params.id);

    if (!entries) return res.status(404);

    return res.send({
      stories: entries.map((entry) => ({
        value: entry.finalValue,
        user: { nickname: entry.user.nickname, id: entry.user.uuid },
      })),
    });
  } catch (err: unknown) {
    return next(err);
  }
};

const router = Router();
router.get('/:id', getArchiveHandler);
router.use(loadUser, loadStory);
router.get('/', joinPhase, getGameHandler);
router.put('/', saveEntryHandler);
export default router;
