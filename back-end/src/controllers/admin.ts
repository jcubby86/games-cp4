import { Router } from 'express';

import { Prisma } from '../.generated/prisma';
import { createAdmin, get, login } from '../models/admin.js';
import { AdminResBody, LoginReqBody, ReqBody } from '../types/domain';
import { ReqHandler } from '../types/express.js';

const loginHandler: ReqHandler<LoginReqBody, AdminResBody> = async (
  req,
  res
) => {
  try {
    const admin = await login(req.body.username, req.body.password);

    req.session = {
      ...req.session,
      adminID: admin.uuid,
      nowInMinutes: Math.floor(Date.now() / 60e3) //refresh cookie
    };
    return res.status(200).send(admin);
  } catch (err) {
    return res.sendStatus(401);
  }
};

const createAdminHandler: ReqHandler = async (req, res) => {
  try {
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      return res.sendStatus(400);
    }
    await createAdmin(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);
    return res.sendStatus(200);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.sendStatus(200);
      }
    }
    return res.sendStatus(401);
  }
};

const getHandler: ReqHandler<ReqBody, AdminResBody> = async (req, res) => {
  if (!req.session?.adminID) return res.sendStatus(404);

  const admin = await get(req.session.adminID);
  return res.status(200).send(admin);
};

const router = Router();
router.post('/', loginHandler);
router.put('/', createAdminHandler);
router.get('/', getHandler);
export default router;
