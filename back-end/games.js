import { Router } from 'express';
import { Schema, model } from 'mongoose';

export const router = Router();

const gameSchema = new Schema({
  type: String,
  code: String,
  phase: String,
  timestamp: Date,
  creator: {
    type: Schema.ObjectId,
    ref: 'User',
  },
});

export const GameModel = model('Game', gameSchema);
