import { Router } from 'express';

import InvalidRequestError from '../errors/InvalidRequestError';
import { adminMiddleware } from '../middleware';
import {
  addSuggestion,
  addSuggestions,
  deleteSuggestion,
  getAll,
  updateSuggestion
} from '../models/suggestion';
import { ReqBody, SuggestionDto, SuggestionReqBody } from '../types/domain';
import { ReqHandler as Handler } from '../types/express.js';

const getAllHandler: Handler<ReqBody, SuggestionDto[]> = async (
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

const addSuggestionHandler: Handler<SuggestionReqBody, SuggestionDto> = async (
  req,
  res,
  next
) => {
  try {
    const suggestion = await addSuggestion(req.body.value, req.body.category);
    return res.status(201).send(suggestion);
  } catch (err) {
    if (err instanceof InvalidRequestError) {
      res.status(400).send({ error: err.message });
    }
    return next(err);
  }
};

const batchAddHandler: Handler<SuggestionReqBody[]> = async (
  req,
  res,
  next
) => {
  try {
    await addSuggestions(req.body);
    return res.sendStatus(200);
  } catch (err) {
    if (err instanceof InvalidRequestError) {
      res.status(400).send({ error: err.message });
    }
    return next(err);
  }
};

const deleteSuggestionHandler: Handler<SuggestionReqBody> = async (
  req,
  res,
  next
) => {
  try {
    await deleteSuggestion(req.params.uuid);
    return res.sendStatus(200);
  } catch (err) {
    if (err instanceof InvalidRequestError) {
      res.status(400).send({ error: err.message });
    }
    return next(err);
  }
};

const updateSuggestionHandler: Handler<
  SuggestionReqBody,
  SuggestionDto
> = async (req, res, next) => {
  try {
    const suggestion = await updateSuggestion(
      req.params.uuid,
      req.body.value,
      req.body.category
    );
    return res.status(200).send(suggestion);
  } catch (err) {
    if (err instanceof InvalidRequestError) {
      res.status(400).send({ error: err.message });
    }
    return next(err);
  }
};

const router = Router();
router.use(adminMiddleware);
router.get('/', getAllHandler);
router.post('/', addSuggestionHandler);
router.delete('/:uuid', deleteSuggestionHandler);
router.patch('/:uuid', updateSuggestionHandler);
router.put('/', batchAddHandler);
export default router;
