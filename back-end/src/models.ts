import { Schema, model, Types } from 'mongoose';

const gameSchema = new Schema(
  {
    type: { type: String, required: true },
    code: { type: String, required: true },
    phase: { type: String, required: true },
  },
  { timestamps: true }
);

const userSchema = new Schema({
  nickname: { type: String, required: true },
  game: {
    type: Types.ObjectId,
    ref: 'Game',
  },
});

const storySchema = new Schema({
  game: {
    type: Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  stories: [
    {
      user: {
        type: Types.ObjectId,
        ref: 'User',
      },
      parts: [String],
    },
  ],
  finalStories: [
    {
      user: {
        type: Types.ObjectId,
        ref: 'User',
      },
      text: String,
    },
  ],
  round: { type: Number, required: true, default: 0 },
});

const namesSchema = new Schema({
  game: {
    type: Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  names: [
    {
      user: {
        type: Types.ObjectId,
        ref: 'User',
      },
      text: String,
    },
  ],
});

export const GameModel = model('Game', gameSchema);
export const UserModel = model('User', userSchema);
export const StoryModel = model('Story', storySchema);
export const NamesModel = model('Names', namesSchema);
