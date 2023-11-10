import { Router } from 'express';
import prisma from './server.js';
import { StoryEntry, Category, Game, GamePhase } from './.generated/prisma';
import { joinPhase, loadStory, loadUser } from './middleware.js';
import { punctRegex, quoteRegex, WAIT } from './utils/constants.js';
import {
  RequestBody,
  StoryRequestBody,
  StoryResponseBody,
  StoryArchiveResponseBody,
  RequestHandler,
} from './types.js';
import {
  getEntryForGame,
  getSuggestion,
  lowerFirst,
  randomNumber,
  upperFirst,
} from './utils/utils.js';

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
  Category.MALE_NAME,
  Category.FEMALE_NAME,
  Category.PRESENT_ACTION,
  Category.STATEMENT,
  Category.STATEMENT,
  Category.PAST_ACTION,
];

function getRoundNumber(entries: StoryEntry[], users: unknown[]) {
  if (entries.length < users.length) {
    return 0;
  } else {
    return Math.min(...entries.map((e) => e.values.length));
  }
}

function isBehind(entry: StoryEntry | undefined, round: number) {
  if (entry === undefined) return true;
  return entry.values.length <= round;
}

/**
 * Check if all players have submitted an entry for the current round.
 * Once all rounds are complete, marks the game as complete.
 *
 * @param {Game} game
 * @param {StoryEntry[]} entries
 * @return {Promise<{ round: number; waitingOnUsers: string[] }>}
 */
async function checkRoundCompletion(
  game: Game,
  entries: StoryEntry[]
): Promise<{ round: number; waitingOnUsers: string[] }> {
  if (game.phase !== GamePhase.PLAY) return { round: 0, waitingOnUsers: [] };

  const users = await prisma.user.findMany({
    where: { gameId: game.id },
    include: { storyEntries: true },
  });

  const round = getRoundNumber(entries, users);
  const waitingOnUsers = users
    .filter((u) => {
      const entry = getEntryForGame(game.id, u.storyEntries);
      return isBehind(entry, round);
    })
    .map((u) => u.nickname);

  if (waitingOnUsers.length > 0 && round < fillers.length) {
    return { round, waitingOnUsers };
  }

  if (round >= fillers.length && (game.phase as GamePhase) !== GamePhase.READ) {
    game.phase = GamePhase.READ;
    await prisma.game.update({
      where: { id: game.id },
      data: { phase: GamePhase.READ },
    });

    const finalEntries = getFinalEntries(entries);
    await prisma.$transaction(
      finalEntries.map((e) =>
        prisma.storyEntry.update({
          where: { id: e.id },
          data: { finalValue: e.finalValue },
        })
      )
    );
  }

  return { round, waitingOnUsers };
}

function getFinalEntries(entries: StoryEntry[]): StoryEntry[] {
  const salt = randomNumber(entries.length);
  for (let i = 0; i < entries.length; i++) {
    const s = [];
    for (let j = 0; j < prefixes.length; j++) {
      s.push(prefixes[j]);
      s.push(entries[(i + j + salt) % entries.length].values[j]);
      s.push(suffixes[j]);
    }

    entries[i].finalValue = s.join('');
  }
  return entries;
}

const getArchive: RequestHandler<
  RequestBody,
  StoryArchiveResponseBody
> = async (req, res, next) => {
  try {
    const entries = await prisma.storyEntry.findMany({
      where: {
        game: { uuid: req.params.id },
      },
      include: { user: true },
    });

    if (!entries) return res.status(404);
    return res.send({
      stories: entries.map((entry) => ({
        value: entry.finalValue,
        user: { nickname: entry.user.nickname, id: entry.user.uuid },
      })),
    });
  } catch (err: unknown) {
    return next(err);
  }
};

const getGame: RequestHandler<RequestBody, StoryResponseBody> = async (
  req,
  res,
  next
) => {
  try {
    if (!req.game || !req.user || !req.storyEntries) return res.sendStatus(500);

    const entries = req.storyEntries;
    const { round, waitingOnUsers } = await checkRoundCompletion(
      req.game,
      entries
    );

    if (req.game.phase === GamePhase.PLAY) {
      const userElem = entries.find((elem) => elem.userId === req.user?.id);

      const category = categories[round];
      const suggestion = await getSuggestion(category);
      return res.send({
        phase: isBehind(userElem, round) ? GamePhase.PLAY : WAIT,
        round: round,
        filler: fillers[round],
        prompt: prompts[round],
        prefix: prefixes[round],
        suffix: suffixes[round],
        placeholder: suggestion,
        users: waitingOnUsers,
      });
    } else {
      return res.send({
        phase: GamePhase.READ,
        story: entries.find((element) => element.userId === req.user?.id)
          ?.finalValue,
        id: req.game.uuid,
        isHost: req.game.hostId === req.user.id,
      });
    }
  } catch (err: unknown) {
    return next(err);
  }
};

const saveEntry: RequestHandler<StoryRequestBody> = async (req, res, next) => {
  try {
    if (!req.game || !req.user || !req.storyEntries) return res.sendStatus(500);
    if (req.game.phase !== GamePhase.PLAY) return res.sendStatus(403);

    const entries = req.storyEntries;
    const { round } = await checkRoundCompletion(req.game, entries);
    let part = req.body.part.replace(quoteRegex, '').trim();
    if (round > 1 && !punctRegex.test(part)) part += '.';
    if (round === 2 || round === 5) {
      part = lowerFirst(part);
    } else {
      part = upperFirst(part);
    }

    const entry = entries.find((element) => element.userId === req.user?.id);
    if (!entry) {
      await prisma.storyEntry.create({
        data: {
          user: { connect: { id: req.user.id } },
          game: { connect: { id: req.game.id } },
          values: [part],
          finalValue: '',
        },
      });
    } else if (entry.values.length > round) {
      return res.sendStatus(403);
    } else {
      await prisma.storyEntry.update({
        where: { id: entry.id },
        data: {
          values: [...entry.values, part],
        },
      });
    }
    return res.sendStatus(201);
  } catch (err: unknown) {
    return next(err);
  }
};

export const router = Router();
router.get('/:id', getArchive);
router.use(loadUser, loadStory);
router.get('/', joinPhase, getGame);
router.put('/', saveEntry);
