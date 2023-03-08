/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { HydratedDocument } from 'mongoose';

export interface IGame {
    type: string,
    code: string, 
    phase: string,
    test: number,
    createdAt: number
}
export type GameDocument = HydratedDocument<IGame>;

export interface IUser {
    game?: HydratedDocument<IGame>,
    nickname: string
}
export type UserDocument = HydratedDocument<IUser>;

interface story {
    user: HydratedDocument<IUser>, 
    parts: string[]
}
export interface IStory {
    game: HydratedDocument<IGame>,
    stories: story[],
    finalStories: story[],
    round: number
}
export type StoryDocument = HydratedDocument<IStory>;

export interface IName {
    game: HydratedDocument<IGame>,
    names: {user:HydratedDocument<IUser>, text:string}[]
}
export type NameDocument = HydratedDocument<IName>;

export type CreateGameFunction = (game: GameDocument) => Promise<void>;