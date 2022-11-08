import { Router } from 'express';
import { Schema, model } from 'mongoose';
import { loadUser, getUsersInGame } from './users.js';

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
  finalStories: [
    {
      user: {
        type: Schema.ObjectId,
        ref: 'User',
      },
      text: String,
    },
  ],
  round: { type: Number, required: true, default: 0 },
});
const StoryModel = model('Story', storySchema);

const prompts = ["Man's name", "Woman's name", 'Activity', '', '', 'Activity'];
const placeholder = ['', '(Man) ', '(Man) and (Woman) ', '', '', ''];
const prefixes = ['', 'and ', 'were ', 'He said, "', 'She said, "', 'So they '];
const suffixes = [' ', ' ', '. ', '." ', '." ', '.'];

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

  req.storyType = await StoryModel.findOne({ game: req.game._id });
  if (!req.storyType) return res.sendStatus(400);
  next();
};

const checkRoundCompletion = async (game, storyType) => {
  const users = await getUsersInGame(game._id);
  const userSet = new Set(users.map((user) => user._id.valueOf()));

  //remove users who may have left the game
  storyType.stories = storyType.stories.filter((elem) =>
    userSet.has(elem.user._id.valueOf())
  );
  if (
    storyType.stories.length < users.length ||
    storyType.stories.findIndex(
      (elem) => elem.parts.length <= storyType.round
    ) !== -1
  )
    return;

  storyType.round += 1;
  if (storyType.round >= prompts.length) await finishGame(game, storyType);

  await storyType.save();
};
const finishGame = async (game, storyType) => {
  game.phase = 'read';
  await game.save();

  const stories = storyType.stories;
  for (let i = 0; i < stories.length; i++) {
    const s = [];
    for (let j = 0; j < 6; j++) {
      s.push(prefixes[j]);
      s.push(stories[(i + j) % stories.length].parts[j]);
      s.push(suffixes[j]);
    }
    storyType.finalStories.push({
      user: stories[i].user._id,
      text: s.join(''),
    });
  }
};

router.get('/', loadUser, loadStory, async (req, res) => {
  try {
    if (req.game.phase === 'join') {
      const users = await getUsersInGame(req.game._id);
      return res.send({
        phase: 'join',
        playerCount: users.length,
        code: req.game.code,
        nickname: req.user.nickname,
      });
    }

    const storyType = req.storyType;
    await checkRoundCompletion(req.game, storyType);
    const round = storyType.round;

    if (req.game.phase === 'play') {
      const userElem = storyType.stories.find((element) =>
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
      return res.send({
        phase: 'read',
        story: storyType.finalStories.find((element) =>
          element.user._id.equals(req.user._id)
        ).text,
      });
    }
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

router.put('/', loadUser, loadStory, async (req, res) => {
  try {
    if (req.game.phase !== 'play') return res.sendStatus(403);

    const storyType = req.storyType;

    let userIndex = storyType.stories.findIndex((element) =>
      element.user._id.equals(req.user._id)
    );
    if (userIndex === -1) {
      storyType.stories.push({ user: req.user._id, parts: [] });
      userIndex = storyType.stories.length - 1;
    }
    if (storyType.stories[userIndex].parts.length > storyType.round)
      return res.sendStatus(403);

    storyType.stories[userIndex].parts.push(req.body.part);

    await storyType.save();
    return res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
