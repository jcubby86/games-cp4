/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { ErrorRequestHandler } from 'express';

import { Prisma } from '../.generated/prisma';

export const notFoundHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return res.sendStatus(404);
    }
  }
  return next(err);
};

export const serverErrorHandler: ErrorRequestHandler = (err, req, res, n) => {
  console.error(err);
  return res.sendStatus(500);
};
