import { Router } from 'express';
import { Schema, model } from 'mongoose';
import { GameModel } from './games.js';
import { UserModel, loadUser, getUsersInGame } from './users.js';

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

const prompts = ["Man's name", "Woman's name", 'Activity', '', '', 'Activity'];
const placeholder = ['', '(Man) ', '(Man) and (Woman) ', '', '', ''];
const prefixes = ['', 'and ', 'were ', 'He said, "', 'She said, "', 'So they '];
const suffixes = ['', '', '. ', '." ', '." ', '.'];

export const createStory = async (game) => {
  const story = new StoryModel({
    game: game._id,
    stories: [],
    round: 0,
  });
  await story.save();
};
const loadStory = async (req, res, next) => {
  if (!req.user || !req.game) return res.sendStatus(401);
  if (req.game.type !== 'story') return res.sendStatus(400);

  req.story = await StoryModel.findOne({ game: req.game._id });
  if (!req.story) return res.sendStatus(400);
  next();
};

const checkRoundCompletion = async (game, story) => {
  const users = await getUsersInGame(game._id);
  const userSet = new Set(users.map((user) => user._id.valueOf()));

  story.stories = story.stories.filter((elem) =>
    userSet.has(elem.user._id.valueOf())
  );
  if (
    story.stories.length < users.length ||
    story.stories.findIndex((elem) => elem.parts.length <= story.round) !== -1
  )
    return;

  story.round += 1;
  if (story.round >= prompts.length) {
    game.phase = 'read';
    await game.save();
  }
};

router.get('/', loadUser, loadStory, async (req, res) => {
  try {
    const story = req.story;
    const round = story.round;

    if (req.game.phase === 'join') {
      const users = await getUsersInGame(req.game._id);
      return res.send({
        phase: 'join',
        playerCount: users.length,
      });
    } else if (req.game.phase === 'play') {
      const userElem = story.stories.find((element) =>
        element.user._id.equals(req.user._id)
      );

      return res.send({
        phase: userElem?.parts.length > round ? 'wait' : 'play',
        round: round,
        prompt: prompts[round],
        placeholder: placeholder[round],
        prefix: prefixes[round],
        suffix: suffixes[round],
      });
    } else {
      return res.send({ phase: 'read' });
    }
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

router.put('/', loadUser, loadStory, async (req, res) => {
  try {
    if (req.game.phase !== 'play') return res.sendStatus(403);

    const story = req.story;

    let userIndex = story.stories.findIndex((element) =>
      element.user._id.equals(req.user._id)
    );
    if (userIndex === -1) {
      story.stories.push({ user: req.user._id, parts: [] });
      userIndex = story.stories.length - 1;
    }
    if (story.stories[userIndex].parts.length > story.round)
      return res.sendStatus(403);

    story.stories[userIndex].parts.push(req.body.part);
    await checkRoundCompletion(req.game, story);

    await story.save();
    return res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
