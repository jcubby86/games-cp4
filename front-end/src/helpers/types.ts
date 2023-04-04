/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

export interface Game {
  type: string;
  code: string;
  phase: string;
  test: number;
  createdAt: Date;
  title?: string;
}

export interface User {
  game?: Game;
  nickname: string;
}

export interface Entry<Type> {
  user: User;
  value: Type;
}

export interface Story {
  game: Game;
  entries: Entry<string[]>[];
  finalEntries: Entry<string>[];
  round: number;
}

export interface Names {
  game: Game;
  entries: Entry<string>[];
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
