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

export interface Entry {
  user: HydratedDocument<IUser>;
}
export interface StringEntry extends Entry {
  text: string;
}
export interface StringArrayEntry extends Entry {
  parts: string[];
}
export interface IStory {
  game: HydratedDocument<IGame>;
  entries: StringArrayEntry[];
  finalEntries: StringEntry[];
  round: number;
}
export type StoryDocument = HydratedDocument<IStory>;

export interface IName {
  game: HydratedDocument<IGame>;
  entries: StringEntry[];
}
export type NamesDocument = HydratedDocument<IName>;

export type CreateGameFunction = (game: Game) => Promise<void>;

export interface Session {
  userID?: Types.ObjectId;
  nowInMinutes: number;
}
