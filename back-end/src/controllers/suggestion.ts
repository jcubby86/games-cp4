import { Router } from 'express';

import { adminMiddleware } from '../middleware';
import { getAll } from '../models/suggestion';
import { ReqBody, SuggestionDto } from '../types/domain';
import { ReqHandler } from '../types/express.js';

const getAllHandler: ReqHandler<ReqBody, SuggestionDto[]> = async (
  req,
  res,
  next
) => {
  try {
    const suggestions = await getAll();
    return res.send(suggestions);
  } catch (err) {
    return next(err);
  }
};

const router = Router();
router.use(adminMiddleware);
router.get('/', getAllHandler);
export default router;
