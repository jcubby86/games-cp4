/* eslint-disable @typescript-eslint/no-namespace */
import { RequestHandler as ExpressRequestHandler } from 'express';

import { ErrorResBody, GameDto, UserDto } from '../domain/types';

declare global {
  namespace Express {
    interface Request {
      user?: UserDto;
      game?: GameDto;
      session?: Session;
    }
  }
}

export interface Session {
  userID: string;
  nowInMinutes: number;
}

export type ReqBody = never;

export type Params = { [key: string]: string };

export type ReqHandler<Req = never, Res = never> = ExpressRequestHandler<
  Params,
  Res | ErrorResBody,
  Req
>;
