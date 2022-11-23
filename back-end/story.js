import { Router } from 'express';
import { StoryModel } from './models.js';
import { loadUser, getUsersInGame } from './users.js';
import { joinPhase } from './utils.js';

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
  'Peter Pan',
  'Elsa',
  'dancing in the rain.',
  'I like cheese.',
  'What did you call me?',
  'went skydiving with the dog.',
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

  const allUsers = await getUsersInGame(game._id);
  const allUserSet = new Set(allUsers.map((user) => user._id.valueOf()));
  const submittedUserSet = new Set(
    storyType.stories.map((item) => item.user._id.valueOf())
  );

  storyType.stories = storyType.stories.filter((elem) =>
    allUserSet.has(elem.user._id.valueOf())
  );

  const allStories = [
    ...storyType.stories,
    ...allUsers
      .filter((user) => !submittedUserSet.has(user._id.valueOf()))
      .map((user) => ({ user: user, parts: [] })),
  ];

  const waitingUsers = allStories
    .filter((elem) => elem.parts.length <= storyType.round)
    .map((elem) => elem.user);

  if (waitingUsers.length > 0) {
    return waitingUsers.map((user) => user.nickname);
  }

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
    const waitingUsers = await checkRoundCompletion(req.game, storyType);

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
        placeholder: placeholders[round],
        users: waitingUsers,
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
      storyType.stories.push({ user: req.user, parts: [] });
      userIndex = storyType.stories.length - 1;
    }
    if (storyType.stories[userIndex].parts.length > storyType.round)
      return res.sendStatus(403);

    let part = req.body.part.replaceAll(quoteRegex, '').trim();
    if (storyType.round > 1 && !punctRegex.test(part)) part += '.';
    if (storyType.round === 2 || storyType.round === 5) {
      part = part.slice(0, 1).toLowerCase() + part.slice(1);
    } else {
      part = part.slice(0, 1).toUpperCase() + part.slice(1);
    }

    storyType.stories[userIndex].parts.push(part);

    await storyType.save();
    return res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
