/* eslint-disable @typescript-eslint/no-namespace */
import { RequestHandler as ExpressRequestHandler } from 'express';
import { NameEntry, StoryEntry } from '../.generated/prisma';
import { ErrorResponseBody, GameDto, UserDto } from '../domain/types';

declare global {
  namespace Express {
    interface Request {
      user?: UserDto | null;
      game?: GameDto | null;
      nameEntries?: NameEntry[] | null;
      storyEntries?: StoryEntry[] | null;
      session?: Session | null;
    }
  }
}

export interface Session {
  userID: string;
  nowInMinutes: number;
}

export type RequestBody = never;

export type Params = { [key: string]: string };

export type RequestHandler<Req = never, Res = never> = ExpressRequestHandler<
  Params,
  Res | ErrorResponseBody,
  Req
>;
