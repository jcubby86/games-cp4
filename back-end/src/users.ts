import { Router } from 'express';
import { Types } from 'mongoose';
import { loadUser } from './middleware.js';
import { GameModel, UserModel } from './models.js';
import { Game } from './types.js';
import { gameExists, getUsersInGame } from './utils.js';

export const router = Router();

/**
 * Check if a username is unique across all players in the same game instance.
 *
 * @param {string} name
 * @param {Game} game
 * @param {Types.ObjectId} [id]
 * @return {*}  {Promise<boolean>}
 */
async function isUniqueUsername(
  name: string,
  game: Game,
  id?: Types.ObjectId
): Promise<boolean> {
  const user = await UserModel.findOne({
    nickname: name,
    game: game,
  });
  return !user || (id != null && user._id.equals(id));
}

/**
 * Join a game.
 * If the user already has a session, we update the session/user
 * rather than creating a new one.
 */
router.post('/', loadUser, async (req, res) => {
  try {
    const game = await GameModel.findOne({ code: req.body.code });
    if (
      !game ||
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

    const isUnique = await isUniqueUsername(
      req.body.nickname,
      game,
      req.user?._id
    );
    if (!isUnique) {
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
    req.session = {
      ...req.session,
      userID: req.user._id,
      nowInMinutes: Math.floor(Date.now() / 60e3), //refresh cookie so it won't expire for another 2 hours
    };

    res.status(statusCode).send(req.user);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

/**
 * Get the state of the user.
 */
router.get('/', loadUser, async (req, res) => {
  if (!req.user) {
    return res.sendStatus(404);
  }
  res.send(req.user);
});

/**
 * Get all the users in a game.
 */
router.get('/:code', async (req, res) => {
  try {
    const game = await GameModel.findOne({ code: req.params.code });
    if (!game) return res.sendStatus(404);
    const users = await getUsersInGame(game);
    res.send(users);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

/**
 * Delete a user.
 */
router.delete('/', loadUser, async (req, res) => {
  try {
    if (req.user) {
      req.user.game = undefined;
      await req.user.save();
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});
