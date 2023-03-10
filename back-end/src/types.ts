/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { HydratedDocument, Types } from 'mongoose';

export interface IGame {
  type: string;
  code: string;
  phase: string;
  test: number;
  createdAt: Date;
}
export type Game = HydratedDocument<IGame> & {
  title?: string;
};

export interface IUser {
  game?: HydratedDocument<IGame>;
  nickname: string;
}
export type User = HydratedDocument<IUser>;

export interface Entry<Type> {
  user: HydratedDocument<IUser>;
  value: Type;
}

export interface IStory {
  game: HydratedDocument<IGame>;
  entries: Entry<string[]>[];
  finalEntries: Entry<string>[];
  round: number;
}
export type StoryDocument = HydratedDocument<IStory>;

export interface INames {
  game: HydratedDocument<IGame>;
  entries: Entry<string>[];
}
export type NamesDocument = HydratedDocument<INames>;

export type CreateGameFunction = (game: Game) => Promise<void>;

export interface Session {
  userID?: Types.ObjectId;
  nowInMinutes: number;
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
}

export interface StoryReqBody {
  part: string;
}
