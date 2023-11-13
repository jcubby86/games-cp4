import { Router } from 'express';

import {
  CreateGameReqBody as CreateReq,
  GameDto as Game,
  UpdateGameReqBody as UpdateReq,
  UserDto,
} from '../domain/types.js';
import {
  createGame,
  getGame,
  getUsers,
  recreateGame,
  updateGamePhase,
} from '../models/games';
import { ReqHandler as Handler, ReqBody } from '../utils/types.js';

const createGameHandler: Handler<CreateReq, Game> = async (req, res, next) => {
  try {
    const game = await createGame(req.body.type);
    console.info('Game created:', JSON.stringify(game));

    return res.status(201).send(game);
  } catch (err: unknown) {
    return next(err);
  }
};

const getGameHandler: Handler<ReqBody, Game> = async (req, res, next) => {
  try {
    const game = await getGame(req.params.code);
    return res.send(game);
  } catch (err: unknown) {
    return next(err);
  }
};

const updatePhaseHandler: Handler<UpdateReq, Game> = async (req, res, next) => {
  try {
    const game = await updateGamePhase(req.params.uuid, req.body.phase);
    if (!game) return res.sendStatus(404);

    console.info('Game updated:', JSON.stringify(game));
    return res.send(game);
  } catch (err: unknown) {
    return next(err);
  }
};

const getUsersHandler: Handler<ReqBody, UserDto[]> = async (req, res, next) => {
  try {
    const users = await getUsers(req.params.uuid);
    return res.send(users);
  } catch (err: unknown) {
    return next(err);
  }
};

const recreateGameHandler: Handler<ReqBody, Game> = async (req, res, next) => {
  try {
    const newGame = await recreateGame(req.params.uuid);
    return res.send(newGame);
  } catch (err: unknown) {
    return next(err);
  }
};

const router = Router();
router.post('/', createGameHandler);
router.get('/:code', getGameHandler);
router.put('/:uuid', updatePhaseHandler);
router.get('/:uuid/users', getUsersHandler);
router.post('/:uuid/recreate', recreateGameHandler);
export default router;
