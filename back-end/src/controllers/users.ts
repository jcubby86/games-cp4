import { Router } from 'express';

import { Prisma } from '../.generated/prisma/index.js';
import AuthenticationError from '../errors/AuthenticationError.js';
import { createUser, get, login } from '../models/users.js';
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
      permissions: user.permissions,
      nowInMinutes: Math.floor(Date.now() / 60e3) //refresh cookie
    };
    return res.status(200).send(user);
  } catch (err) {
    return res.sendStatus(401);
  }
};

const createAdminHandler: ReqHandler = async (req, res) => {
  try {
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      return res.sendStatus(400);
    }
    await createUser(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);
    return res.sendStatus(200);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.sendStatus(200);
      }
    }
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
