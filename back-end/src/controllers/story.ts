import { Router } from 'express';

import { Category, Game, GamePhase, StoryEntry } from '../.generated/prisma';
import {
  StoryArchiveResBody as ArchiveRes,
  StoryReqBody,
  StoryResBody,
  UserDto,
} from '../domain/types.js';
import { joinPhase, loadStory, loadUser } from '../middleware.js';
import prisma from '../prisma';
import { WAIT, punctRegex, quoteRegex } from '../utils/constants.js';
import { ReqHandler as Handler, ReqBody as ReqBody } from '../utils/types.js';
import {
  getSuggestion,
  lowerFirst,
  randomNumber,
  upperFirst,
} from '../utils/utils.js';

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

function getRoundNumber(users: UserDto[]): number {
  const lengths = users.map((u) => u.storyEntries?.at(0)?.values.length ?? 0);
  return Math.min(...lengths);
}

function isBehind(entry: StoryEntry | undefined | null, round: number) {
  if (!entry) return true;
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
  game: Game
): Promise<{ round: number; waitingOnUsers: string[] }> {
  if (game.phase !== GamePhase.PLAY) return { round: 0, waitingOnUsers: [] };

  const users = await prisma.user.findMany({
    where: { gameId: game.id },
    include: {
      storyEntries: {
        where: { gameId: game.id },
      },
    },
  });

  const round = getRoundNumber(users);
  const waitingOnUsers = users
    .filter((u) => isBehind(u.storyEntries.at(0), round))
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

    const finalEntries = getFinalEntries(users.map((u) => u.storyEntries[0]));
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

function processValue(part: string, round: number) {
  let value = part.replace(quoteRegex, '').trim();
  if (round > 1 && !punctRegex.test(value)) value += '.';
  if (round === 2 || round === 5) {
    value = lowerFirst(value);
  } else {
    value = upperFirst(value);
  }
  return value;
}

const getGame: Handler<ReqBody, StoryResBody> = async (req, res, next) => {
  try {
    if (!req.game || !req.user) return res.sendStatus(403);

    const { round, waitingOnUsers } = await checkRoundCompletion(req.game);
    const entry = await prisma.storyEntry.findUnique({
      where: {
        gameId_userId: {
          gameId: req.game.id,
          userId: req.user.id,
        },
      },
    });
    if (req.game.phase === GamePhase.PLAY) {
      const category = categories[round];
      const suggestion = await getSuggestion(category);
      return res.send({
        phase: isBehind(entry, round) ? GamePhase.PLAY : WAIT,
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
        story: entry?.finalValue,
        id: req.game.uuid,
        isHost: req.game.hostId === req.user.id,
      });
    }
  } catch (err: unknown) {
    return next(err);
  }
};

const saveEntry: Handler<StoryReqBody> = async (req, res, next) => {
  try {
    if (!req.game || !req.user) return res.sendStatus(403);
    if (req.game.phase !== GamePhase.PLAY) return res.sendStatus(403);

    const { round } = await checkRoundCompletion(req.game);
    const value = processValue(req.body.part, round);
    const entry = await prisma.storyEntry.findUnique({
      where: {
        gameId_userId: {
          gameId: req.game.id,
          userId: req.user.id,
        },
      },
    });

    if (!entry) {
      await prisma.storyEntry.create({
        data: {
          user: { connect: { id: req.user.id } },
          game: { connect: { id: req.game.id } },
          values: [value],
          finalValue: '',
        },
      });
    } else if (entry.values.length > round) {
      return res.sendStatus(403);
    } else {
      await prisma.storyEntry.update({
        where: { id: entry.id },
        data: {
          values: [...entry.values, value],
        },
      });
    }
    return res.sendStatus(201);
  } catch (err: unknown) {
    return next(err);
  }
};

const getArchive: Handler<ReqBody, ArchiveRes> = async (req, res, next) => {
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

const router = Router();
router.get('/:id', getArchive);
router.use(loadUser, loadStory);
router.get('/', joinPhase, getGame);
router.put('/', saveEntry);
export default router;
