/* eslint-disable @typescript-eslint/no-namespace */
import {
  RequestHandler as ExpressRequestHandler,
  NextFunction,
  Request,
  Response
} from 'express';

import { GameDto, PlayerDto, ReqBody, ResBody } from './domain';

declare global {
  namespace Express {
    interface Request {
      player?: PlayerDto;
      game?: GameDto;
      session?: Session;
    }
  }
}

export interface Session {
  adminID?: string;
  playerId?: string;
  nowInMinutes?: number;
}

export type Params = { [key: string]: string };
export type Req<T extends ReqBody = never> = Request<Params, never, T>;
export type Res<U extends ResBody | ResBody[] = never> = Response<U | ResBody>;
export type Next = NextFunction;

export interface ReqHandler<
  T extends ReqBody = never,
  U extends ResBody | ResBody[] = never
> extends ExpressRequestHandler<Params, U | ResBody, T> {
  (req: Req<T>, res: Res<U | ResBody>, next: Next): Promise<unknown>;
}
