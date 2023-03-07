import { Router } from 'express';
import { GameModel, UserModel } from './models.js';

export const router = Router();

const gameExists = (game: any) =>
  game && new Date().getTime() - 2 * 60 * 60 * 1000 < game.createdAt;

export const loadUser = async (req: any, res: any, next: any) => {
  try {
    if (!req.session.userID) return next();

    const user = await UserModel.findOne({ _id: req.session.userID }).populate(
      'game'
    );
    if (!user) return next();

    if (!gameExists(user.game)) {
      user.game = undefined;
      await user.save();
    }

    req.user = user;
    req.game = user.game;
    next();
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};
export const getUsersInGame = async (id: any) => {
  const users = await UserModel.find({ game: id });
  return users;
};

const uniqueUsername = async (name: any, game: any, id = null) => {
  const user = await UserModel.findOne({
    nickname: name,
    game: game,
  });
  return !user || (id != null && user._id.equals(id));
};

router.post('/', loadUser, async (req: any, res) => {
  try {
    const game = await GameModel.findOne({ code: req.body.code });
    if (
      !gameExists(game) ||
      !(game?.phase === 'join' || req.user?.game?.equals(game))
    ) {
      console.warn(
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
      console.warn(`The nickname ${req.body.nickname} is already taken`);
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
      console.info('User created:', JSON.stringify(req.user));
    } else {
      req.user.nickname = req.body.nickname;
      req.user.game = game;
      statusCode = 200;
    }

    await req.user.save();
    req.session.userID = req.user._id;
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3); //refresh cookie so it won't expire for another 2 hours

    res.status(statusCode).send(req.user);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.get('/', loadUser, async (req: any, res) => {
  if (!req.user) {
    return res.sendStatus(404);
  }
  res.send(req.user);
});

router.get('/:code', async (req, res) => {
  try {
    const game = await GameModel.findOne({ code: req.params.code });
    if (!game) return res.sendStatus(404);
    const users = await getUsersInGame(game._id);
    res.send(users);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.delete('/', loadUser, async (req: any, res) => {
  try {
    if (req.user) {
      req.user.game = null;
      await req.user.save();
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});
