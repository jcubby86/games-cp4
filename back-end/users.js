import { Router } from "express";
import { Schema, model } from 'mongoose';
import { GameModel } from "./games.js";

export const router = Router();

const userSchema = new Schema({
  nickname: String,
  creator: Boolean,
  game: {
    type: Schema.ObjectId,
    ref: 'Game'
  },
});

export const UserModel = model('User', userSchema);
