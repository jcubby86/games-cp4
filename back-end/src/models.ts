import { Schema, model } from 'mongoose';
import { IGame, IUser, IStory, INames, IRecreate } from './types';

const gameSchema = new Schema<IGame>(
  {
    type: { type: String, required: true },
    code: { type: String, required: true },
    phase: { type: String, required: true },
  },
  { timestamps: true }
);

const userSchema = new Schema<IUser>({
  nickname: { type: String, required: true },
  game: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
  },
});

const storySchema = new Schema<IStory>({
  game: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  entries: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      value: [String],
    },
  ],
  finalEntries: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      value: String,
    },
  ],
  round: { type: Number, required: true, default: 0 },
});

const namesSchema = new Schema<INames>({
  game: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  entries: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      value: String,
    },
  ],
});

const recreateSchema = new Schema<IRecreate>({
  oldGame: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
  },
  newGame: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
  },
});

export const GameModel = model<IGame>('Game', gameSchema);
export const UserModel = model<IUser>('User', userSchema);
export const StoryModel = model<IStory>('Story', storySchema);
export const NamesModel = model<INames>('Names', namesSchema);
export const RecreateModel = model<IRecreate>('Recreate', recreateSchema);
