import { Router } from 'express';

import { Prisma } from '../.generated/prisma';
import { createAdmin, login } from '../models/admin.js';
import { LoginReqBody } from '../types/domain';
import { ReqHandler } from '../types/express.js';

const loginHandler: ReqHandler<LoginReqBody> = async (
  req,
  res
) => {
  try {
    const admin = await login(req.body.username, req.body.password);

    req.session = {
      ...req.session,
      adminID: admin,
      nowInMinutes: Math.floor(Date.now() / 60e3) //refresh cookie
    };
    return res.sendStatus(200);
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

const router = Router();
router.post('/', loginHandler);
router.put('/', createAdminHandler);
export default router;
