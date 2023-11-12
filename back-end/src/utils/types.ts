/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-namespace */
import {
  RequestHandler as ExpressRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';

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

export interface ReqHandler<Req = never, Res = never>
  extends ExpressRequestHandler<Params, Res | ErrorResBody, Req> {
  (
    req: Request<Params, Res, Req>,
    res: Response<Res | ErrorResBody>,
    next: NextFunction
  ): Promise<unknown>;
}
