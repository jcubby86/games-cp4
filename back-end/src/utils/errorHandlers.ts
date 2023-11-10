/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Prisma } from '../.generated/prisma';
import { ErrorMiddleware } from '../types';

export const notFoundHandler: ErrorMiddleware = (err, req, res, next) => {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2025'
  ) {
    return res.sendStatus(404);
  }
  return next();
};

export const serverErrorHandler: ErrorMiddleware = (err, req, res, n) => {
  console.error(err);
  return res.sendStatus(500);
};
