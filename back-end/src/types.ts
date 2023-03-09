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
export type Game = HydratedDocument<IGame>;

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
