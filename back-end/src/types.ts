/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { HydratedDocument, Types } from 'mongoose';

/*
 
                                                    
   _ __ ___   ___  _ __   __ _  ___   ___  ___  ___ 
  | '_ ` _ \ / _ \| '_ \ / _` |/ _ \ / _ \/ __|/ _ \
  | | | | | | (_) | | | | (_| | (_) | (_) \__ \  __/
  |_| |_| |_|\___/|_| |_|\__, |\___/ \___/|___/\___|
                         |___/                      
 
*/

export interface IGame {
  type: string;
  code: string;
  phase: string;
  createdAt: Date;
  host?: string;
}
export type Game = HydratedDocument<IGame> & {
  title?: string;
};

export interface IUser {
  game?: HydratedDocument<IGame>;
  nickname: string;
}
export type User = HydratedDocument<IUser> & {
  isHost?: boolean;
};

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

export interface IRecreate {
  oldGame: HydratedDocument<IGame>;
  newGame: HydratedDocument<IGame>;
}
export type Recreate = HydratedDocument<IRecreate>;

/*
 
         _   _               
    ___ | |_| |__   ___ _ __ 
   / _ \| __| '_ \ / _ \ '__|
  | (_) | |_| | | |  __/ |   
   \___/ \__|_| |_|\___|_|   
                             
 
*/

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
