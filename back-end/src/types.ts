/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import {
  NameEntry,
  Game as PrismaGame,
  User as PrismaUser,
  StoryEntry,
} from '@prisma/client';

/*
 
              _                     
   _ __  _ __(_)___ _ __ ___   __ _ 
  | '_ \| '__| / __| '_ ` _ \ / _` |
  | |_) | |  | \__ \ | | | | | (_| |
  | .__/|_|  |_|___/_| |_| |_|\__,_|
  |_|                               
 
*/

export type Game = PrismaGame & {
  title?: string;
};

export type User = PrismaUser & {
  game?: Game | null;
};

export interface Entry<Type> {
  user: PrismaUser;
  value: Type;
}

/*
 
   ____ _____ ___  
  |  _ \_   _/ _ \ 
  | | | || || | | |
  | |_| || || |_| |
  |____/ |_| \___/ 
                   
 
*/

export interface PostGameReqBody {
  type: string;
}

export interface UpdateGameReqBody {
  phase: string;
}

export type Params = { [key: string]: string };

export interface JoinReqBody {
  code: string;
  nickname: string;
}

export interface JoinResBody {
  phase: string;
  users?: string[];
  code?: string;
  nickname?: string;
  isHost?: boolean;
}

export interface NamesResBody extends JoinResBody {
  text?: string;
  placeholder?: string;
  names?: string[];
}

export interface NamesReqBody {
  text: string;
}

export interface StoryResBody extends JoinResBody {
  prompt?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  story?: string;
  filler?: string;
  round?: number;
  id?: string;
}

export interface StoryReqBody {
  part: string;
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
      user?: User | null | undefined;
      game?: Game | null | undefined;
      names?: NameEntry[] | null | undefined;
      story?: StoryEntry[] | null | undefined;
      session?: Session | null | undefined;
    }
  }
}

/*
 
         _   _               
    ___ | |_| |__   ___ _ __ 
   / _ \| __| '_ \ / _ \ '__|
  | (_) | |_| | | |  __/ |   
   \___/ \__|_| |_|\___|_|   
                             
 
*/

export interface Session {
  userID?: string;
  nowInMinutes: number;
}
