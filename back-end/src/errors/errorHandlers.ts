/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { ErrorRequestHandler as ErrorHandler } from 'express';

import { Prisma } from '../.generated/prisma';

export const prismaErrorHandler: ErrorHandler = (err, req, res, next) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return res.sendStatus(404);
    } else if (err.code === 'P2002') {
      return res.sendStatus(403);
    }
  }
  return next(err);
};

export const serverErrorHandler: ErrorHandler = (err, req, res, n) => {
  console.error(err);
  return res.sendStatus(500);
};
