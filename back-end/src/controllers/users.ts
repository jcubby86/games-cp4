import { Router } from 'express';

import AuthenticationError from '../errors/AuthenticationError.js';
import { createAdminUser, get, login } from '../models/users.js';
import { LoginReqBody, ReqBody, UserResBody } from '../types/domain.js';
import { ReqHandler } from '../types/express.js';

const loginHandler: ReqHandler<LoginReqBody, UserResBody> = async (
  req,
  res
) => {
  try {
    const user = await login(req.body.username, req.body.password);

    req.session = {
      ...req.session,
      userId: user.uuid,
      permissions: user.permissions
    };
    return res.status(200).send(user);
  } catch (err) {
    return res.sendStatus(401);
  }
};

const createAdminHandler: ReqHandler = async (req, res) => {
  try {
    await createAdminUser();
    return res.sendStatus(200);
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return res
        .status(401)
        .send({ error: 'Admin credentials not found in environment.' });
    }
    return res.sendStatus(401);
  }
};

const getHandler: ReqHandler<ReqBody, UserResBody> = async (req, res) => {
  try {
    if (!req.session?.userId) return res.sendStatus(404);

    const user = await get(req.session.userId);
    return res.status(200).send(user);
  } catch (err) {
    return res.sendStatus(401);
  }
};

const router = Router();
router.post('/', loginHandler);
router.put('/', createAdminHandler);
router.get('/', getHandler);
export default router;
