/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import {
  NameEntry,
  Game as PrismaGame,
  User as PrismaUser,
  StoryEntry,
} from './.generated/prisma';

/*
 
              _                     
   _ __  _ __(_)___ _ __ ___   __ _ 
  | '_ \| '__| / __| '_ ` _ \ / _` |
  | |_) | |  | \__ \ | | | | | (_| |
  | .__/|_|  |_|___/_| |_| |_|\__,_|
  |_|                               
 
*/

export interface Game extends PrismaGame {
  title?: string;
}

export interface User extends PrismaUser {
  game?: Game | null;
}

/*
 
   ____ _____ ___  
  |  _ \_   _/ _ \ 
  | | | || || | | |
  | |_| || || |_| |
  |____/ |_| \___/ 
                   
 
*/

export interface CreateGameRequestBody {
  type: string;
}
export interface UpdateGameRequestBody {
  phase: string;
}
export interface JoinGameRequestBody {
  code: string;
  nickname: string;
}
export interface NamesRequestBody {
  text: string;
}
export interface StoryRequestBody {
  part: string;
}

export interface JoinPhaseResponseBody {
  phase: string;
  users?: string[];
  code?: string;
  nickname?: string;
  isHost?: boolean;
}
export interface NamesResponseBody extends JoinPhaseResponseBody {
  text?: string;
  placeholder?: string;
  names?: string[];
}
export interface StoryResponseBody extends JoinPhaseResponseBody {
  prompt?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  story?: string;
  filler?: string;
  round?: number;
  id?: string;
}
export interface StoryArchiveResponseBody {
  stories: {
    value: string;
    user: { nickname: string; id: string };
  }[];
}

/*
 
                                     
    _____  ___ __  _ __ ___  ___ ___ 
   / _ \ \/ / '_ \| '__/ _ \/ __/ __|
  |  __/>  <| |_) | | |  __/\__ \__ \
   \___/_/\_\ .__/|_|  \___||___/___/
            |_|                      
 
*/
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User | null;
      game?: Game | null;
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

export interface ErrorResponseBody {
  error?: string;
}

export type Params = { [key: string]: string };

export type Middleware<Req = never, Res = never> = (
  req: Request<Params, Res, Req>,
  res: Response<Res | ErrorResponseBody>,
  next: NextFunction
) => Promise<unknown>;

export type ErrorMiddleware<Req = never, Res = never> = (
  err: Error,
  req: Request<Params, Res, Req>,
  res: Response<Res | ErrorResponseBody>,
  next: NextFunction
) => Promise<unknown>;
