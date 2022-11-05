import { Router } from 'express';
import { Schema, model } from 'mongoose';
import { GameModel } from './games.js';
import { UserModel, validUser, getUsersInGame } from './users.js';

export const router = Router();

const storySchema = new Schema({
  game: {
    type: Schema.ObjectId,
    ref: 'Game',
    required: true,
  },
  stories: [
    {
      user: {
        type: Schema.ObjectId,
        ref: 'User',
      },
      parts: [String],
    },
  ],
  round: { type: Number, required: true, default: 0 },
});

const StoryModel = model('Story', storySchema);

// const hints = ['', '(Man) ', '(Man) and (Woman) ', '', '', ''];
// const prompts = ['', 'and ', 'were ', 'He said, "', 'She said, "', 'So they '];
// const promptsEnd = ['', '', '. ', '." ', '." ', '.'];

export const createStory = async (game) => {
  const story = new StoryModel({
    game: game,
    stories: [],
    round: 1,
  });
  await story.save();
};

router.get('/', validUser, async (req, res) => {
  try {
    if (!req.user || !req.user.game) {
      return res.sendStatus(401);
    }

    let user = req.user;
    let game = user.game;
    const story = await StoryModel.findOne({ game: game._id });

    if (game.phase === 'join') {
      const users = await getUsersInGame(game._id);
      return res.send({
        phase: 'join',
        playerCount: users.length,
      });
    } else if (game.phase === 'play') {
      const userStory = story.stories.find((element) =>
        element.user._id.equals(user._id)
      );

      return res.send({
        phase: userStory?.parts.length === story.round ? 'wait' : 'play',
        round: story.round,
      });
    } else {
      return res.send({ phase: 'read', game: game });
    }
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});
