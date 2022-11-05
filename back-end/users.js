import { Router } from 'express';
import { Schema, model } from 'mongoose';
import { GameModel } from './games.js';

export const router = Router();

const userSchema = new Schema({
  nickname: String,
  game: {
    type: Schema.ObjectId,
    ref: 'Game',
  },
});

export const UserModel = model('User', userSchema);

const gameExists = (game) => game !== null && game.phase !== 'end';

const validUser = async (req, res, next) => {
  try {
    if (!req.session.userID) return next();

    const user = await UserModel.findOne({ _id: req.session.userID }).populate(
      'game'
    );
    if (!user) return next();

    if (!gameExists(user.game)) {
      user.game = null;
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    return res.sendStatus(500);
  }
};
const uniqueUsername = async (name, game, id = null) => {
  let user = await UserModel.findOne({
    nickname: name,
    game: game,
  });
  return !user || user._id === id;
};

router.post('/', validUser, async (req, res) => {
  try {
    let game = await GameModel.findOne({ code: req.body.code });
    if (
      !gameExists(game) ||
      !(game.phase === 'join' || req.user.game === game)
    ) {
      console.log(
        `Game with code ${req.body.code} does not exist or can no longer be joined.`
      );
      return res
        .status(400)
        .send(
          `Game with code ${req.body.code} does not exist or can no longer be joined.`
        );
    }

    const isUniqueUsername = await uniqueUsername(
      req.body.nickname,
      game,
      req.user?._id
    );
    if (!isUniqueUsername) {
      console.log(`The nickname ${req.body.nickname} is already taken`);
      return res
        .status(400)
        .send(`The nickname ${req.body.nickname} is already taken`);
    }

    let statusCode = 201;
    if (!req.user) {
      req.user = new UserModel({
        game: game,
        nickname: req.body.nickname,
      });
      console.log('User created:', JSON.stringify(req.user));
    } else {
      req.user.nickname = req.body.nickname;
      req.user.game = game;
      statusCode = 200;
    }

    await req.user.save();
    req.session.userID = req.user._id;

    res.status(statusCode).send(req.user);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});
