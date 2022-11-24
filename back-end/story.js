import { Router } from 'express';
import { StoryModel } from './models.js';
import { loadUser } from './users.js';
import { joinPhase, getAllSubmissions } from './utils.js';
import { upperFirst, lowerFirst } from './utils.js';

import male_names from './generation/male_names.js';
import female_names from './generation/female_names.js';
import actions_past from './generation/actions_past.js';
import actions_present from './generation/actions_present.js';
import statements from './generation/statements.js';
import { randomElement } from './generation/generationUtils.js';

const punctRegex = /.*([.!?])$/;
const quoteRegex = /["“”]/g;

const prompts = [
  "Man's name:",
  "Woman's name:",
  'Activity:',
  'Statement:',
  'Statement:',
  'Activity:',
];
const fillers = ['', '(Man) ', '(Man) and (Woman) ', '', '', ''];
const placeholders = [
  male_names,
  female_names,
  actions_present,
  statements,
  statements,
  actions_past,
];
const prefixes = ['', 'and ', 'were ', 'He said, "', 'She said, "', 'So they '];
const suffixes = [' ', ' ', ' ', '" ', '" ', ' '];

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

  req.storyType = await StoryModel.findOne({ game: req.game._id }).populate(
    'stories.user'
  );
  if (!req.storyType) return res.sendStatus(400);
  next();
};

const checkRoundCompletion = async (game, storyType) => {
  if (game.phase !== 'play') return [];

  const userToStory = (user) => ({ user: user, parts: [] });
  storyType.stories = await getAllSubmissions(
    game,
    storyType.stories,
    userToStory
  );

  const waitingOnUsers = storyType.stories
    .filter((elem) => elem.parts.length <= storyType.round)
    .map((elem) => elem.user?.nickname);

  if (waitingOnUsers.length > 0) return waitingOnUsers;

  storyType.round += 1;
  if (storyType.round >= fillers.length) await finishGame(game, storyType);

  await storyType.save();
  return [];
};

const finishGame = async (game, storyType) => {
  if (game.phase === 'read') return;
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

export const router = Router();
router.use(loadUser, loadStory);

router.get('/', joinPhase, async (req, res) => {
  try {
    const storyType = req.storyType;
    const waitingOnUsers = await checkRoundCompletion(req.game, storyType);

    if (req.game.phase === 'play') {
      const round = storyType.round;
      const userElem = storyType.stories.find((element) =>
        element.user._id.equals(req.user._id)
      );

      return res.send({
        phase: userElem?.parts.length > round ? 'wait' : 'play',
        round: round,
        filler: fillers[round],
        prompt: prompts[round],
        prefix: prefixes[round],
        suffix: suffixes[round],
        placeholder: randomElement(placeholders[round]),
        users: waitingOnUsers,
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

router.put('/', async (req, res) => {
  try {
    if (req.game.phase !== 'play') return res.sendStatus(403);

    const storyType = req.storyType;

    let userIndex = storyType.stories.findIndex((element) =>
      element.user._id.equals(req.user._id)
    );
    if (userIndex === -1) {
      userIndex = storyType.stories.length;
      storyType.stories.push({ user: req.user, parts: [] });
    }
    if (storyType.stories[userIndex].parts.length > storyType.round)
      return res.sendStatus(403);

    let part = req.body.part.replaceAll(quoteRegex, '').trim();
    if (storyType.round > 1 && !punctRegex.test(part)) part += '.';
    if (storyType.round === 2 || storyType.round === 5) {
      part = lowerFirst(part);
    } else {
      part = upperFirst(part);
    }

    storyType.stories[userIndex].parts.push(part);

    await storyType.save();
    return res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
