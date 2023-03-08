/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { HydratedDocument, Types } from 'mongoose';

export interface IGame {
  type: string;
  code: string;
  phase: string;
  test: number;
  createdAt: Date;
}
export type GameDocument = HydratedDocument<IGame>;

export interface IUser {
  game?: HydratedDocument<IGame>;
  nickname: string;
}
export type UserDocument = HydratedDocument<IUser>;

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
  stories: StringArrayEntry[];
  finalStories: StringEntry[];
  round: number;
}
export type StoryDocument = HydratedDocument<IStory>;

export interface IName {
  game: HydratedDocument<IGame>;
  names: StringEntry[];
}
export type NamesDocument = HydratedDocument<IName>;

export type CreateGameFunction = (game: GameDocument) => Promise<void>;

export interface Session {
  userID?: Types.ObjectId;
  nowInMinutes: number;
}
