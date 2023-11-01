import { Router, Request, Response } from 'express';
import { StoryModel } from './models.js';
import { getAllEntries } from './utils.js';
import { upperFirst, lowerFirst } from './utils.js';
import { getSuggestion, randomNumber } from './suggestion/utils.js';
import { joinPhase, loadStory, loadUser } from './middleware.js';
import {
  Entry,
  Game,
  StoryDocument,
  User,
  StoryReqBody,
  StoryResBody,
  Params,
} from './types.js';
import {
  ACTIONS_PAST,
  ACTIONS_PRESENT,
  FEMALE_NAMES,
  MALE_NAMES,
  PLAY,
  punctRegex,
  quoteRegex,
  READ,
  STATEMENTS,
  WAIT,
} from './helpers/constants.js';

const fillers = ['', '(Man) ', '(Man) and (Woman) ', '', '', ''];
const prefixes = ['', 'and ', 'were ', 'He said, "', 'She said, "', 'So they '];
const suffixes = [' ', ' ', ' ', '" ', '" ', ' '];
const prompts = [
  "Man's name:",
  "Woman's name:",
  'Activity:',
  'Statement:',
  'Statement:',
  'Activity:',
];
const categories = [
  MALE_NAMES,
  FEMALE_NAMES,
  ACTIONS_PRESENT,
  STATEMENTS,
  STATEMENTS,
  ACTIONS_PAST,
];

/**
 * Create a Story Document for a game.
 *
 * @export
 * @param {Game} game
 * @return {*}  {Promise<void>}
 */
export async function createStory(game: Game): Promise<void> {
  const story = new StoryModel({
    game: game._id,
    entries: [],
    round: 0,
  });
  await story.save();
}

/**
 * Check if all players have submitted an entry for the current round.
 * Once all rounds are complete, marks the game as complete.
 *
 * @param {Game} game
 * @param {StoryDocument} story
 * @return {*}  {Promise<string[]>}
 */
async function checkRoundCompletion(
  game: Game,
  story: StoryDocument
): Promise<string[]> {
  if (game.phase !== PLAY) return [];

  const createStoryEntry = (user: User): Entry<string[]> => ({
    user: user,
    value: [],
  });
  story.entries = await getAllEntries(game, story.entries, createStoryEntry);

  const waitingOnUsers = story.entries
    .filter((elem) => elem.value.length <= story.round)
    .map((elem) => elem.user?.nickname);

  if (waitingOnUsers.length > 0) return waitingOnUsers;

  story.round += 1;
  if (story.round >= fillers.length && game.phase !== READ) {
    game.phase = READ;
    await game.save();

    story.finalEntries = getFinalEntries(game, story)
  }

  await story.save();
  return [];
}

/**
 * Generates the completed stories at the end of the game.
 *
 * @param {Game} game
 * @param {StoryDocument} story
 * @return {*}  {Entry<string>[]}
 */
function getFinalEntries(game: Game, story: StoryDocument): Entry<string>[] {
  const stories = story.entries;
  const finalEntries: Entry<string>[] = [];
  const salt = randomNumber(stories.length);
  for (let i = 0; i < stories.length; i++) {
    const s = [];
    for (let j = 0; j < prefixes.length; j++) {
      s.push(prefixes[j]);
      s.push(stories[(i + j + salt) % stories.length].value[j]);
      s.push(suffixes[j]);
    }
    finalEntries.push({
      user: stories[i].user,
      value: s.join(''),
    });
  }
  return finalEntries;
}

export const router = Router();

router.get(
  '/:id',
  async (req: Request<Params, unknown, unknown>, res: Response<unknown>) => {
    try {
      const story: StoryDocument | null = await StoryModel.findOne({
        _id: req.params.id,
      }).populate('finalEntries.user');
      if (!story) return res.status(404);
      return res.send({
        id: story.id,
        stories: story.finalEntries.map((entry) => ({
          value: entry.value,
          user: { nickname: entry.user.nickname, id: entry.user.id },
        })),
      });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }
);

router.use(loadUser, loadStory);

/**
 * Get the state of the game.
 */
router.get(
  '/',
  joinPhase,
  async (
    req: Request<unknown, unknown, unknown>,
    res: Response<StoryResBody>
  ) => {
    try {
      if (!req.game || !req.user || !req.story) return res.sendStatus(500);

      const story = req.story;
      const userId = req.user._id;
      const waitingOnUsers = await checkRoundCompletion(req.game, story);

      if (req.game.phase === PLAY) {
        const round = story.round;
        const userElem = story.entries.find((elem) =>
          elem.user._id.equals(userId)
        );

        const canPlay = !userElem || userElem.value.length <= round;
        const category = categories[round];
        const suggestion = await getSuggestion(category);
        return res.send({
          phase: canPlay ? PLAY : WAIT,
          round: round,
          filler: fillers[round],
          prompt: prompts[round],
          prefix: prefixes[round],
          suffix: suffixes[round],
          placeholder: canPlay ? suggestion : '',
          users: waitingOnUsers,
        });
      } else {
        return res.send({
          phase: READ,
          story: story.finalEntries.find((element) =>
            element.user._id.equals(userId)
          )?.value,
          id: story.id,
          isHost: req.user.isHost,
        });
      }
    } catch (error) {
      console.error(error);
      return res.sendStatus(500);
    }
  }
);

/**
 * Save a user's entry.
 */
router.put(
  '/',
  async (req: Request<unknown, unknown, StoryReqBody>, res: Response) => {
    try {
      if (!req.game || !req.user || !req.story) return res.sendStatus(500);

      if (req.game.phase !== PLAY) return res.sendStatus(403);

      const story = req.story;
      const userId = req.user._id;

      let userIndex = story.entries.findIndex((element) =>
        element.user._id.equals(userId)
      );
      if (userIndex === -1) {
        userIndex = story.entries.length;
        story.entries.push({ user: req.user, value: [] });
      }
      if (story.entries[userIndex].value.length > story.round)
        return res.sendStatus(403);

      let part = req.body.part.replace(quoteRegex, '').trim();
      if (story.round > 1 && !punctRegex.test(part)) part += '.';
      if (story.round === 2 || story.round === 5) {
        part = lowerFirst(part);
      } else {
        part = upperFirst(part);
      }

      story.entries[userIndex].value.push(part);

      await story.save();
      return res.sendStatus(201);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }
);
