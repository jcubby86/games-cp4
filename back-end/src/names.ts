import { Router } from 'express';

import { Category, Game, GamePhase } from './.generated/prisma';
import { NamesReqBody, NamesResBody as ResBody } from './domain/types.js';
import { joinPhase, loadNames, loadUser } from './middleware.js';
import prisma from './prisma';
import { WAIT, quoteRegex } from './utils/constants.js';
import { ReqBody as ReqBody, ReqHandler as ReqHandler } from './utils/types.js';
import {
  getSuggestion,
  randomElement,
  shuffleArray,
  upperFirst,
} from './utils/utils.js';

const categories = [Category.MALE_NAME, Category.FEMALE_NAME];

/**
 * Check if all players have submitted an entry.
 *
 * @param {Game} game
 * @return {*}  {Promise<string[]>}
 */
async function checkCompletion(game: Game): Promise<string[]> {
  if (game.phase !== GamePhase.PLAY) return [];

  const users = await prisma.user.findMany({
    where: { gameId: game.id },
    include: {
      nameEntries: {
        where: { gameId: game.id },
      },
    },
  });

  const waitingOnUsers = users
    .filter((u) => u.nameEntries.at(0) === undefined)
    .map((u) => u.nickname);

  if (waitingOnUsers.length > 0) {
    return waitingOnUsers;
  }

  if ((game.phase as GamePhase) !== GamePhase.READ) {
    game.phase = GamePhase.READ;
    await prisma.game.update({
      where: { id: game.id },
      data: { phase: GamePhase.READ },
    });
  }

  return [];
}

const getGameState: ReqHandler<ReqBody, ResBody> = async (req, res, next) => {
  try {
    if (!req.game || !req.user) return res.sendStatus(403);

    const waitingOnUsers = await checkCompletion(req.game);
    const isHost = req.game.hostId === req.user.id;

    if (req.game.phase === GamePhase.PLAY) {
      const userElem = await prisma.nameEntry.findUnique({
        where: {
          gameId_userId: {
            gameId: req.game.id,
            userId: req.user.id,
          },
        },
      });

      const category = randomElement(categories);
      const suggestion = await getSuggestion(category);
      return res.send({
        phase: !userElem ? GamePhase.PLAY : WAIT,
        users: waitingOnUsers,
        text: userElem?.name,
        placeholder: suggestion,
      });
    } else if (req.game.phase === GamePhase.READ) {
      const entries = await prisma.nameEntry.findMany({
        where: { gameId: req.game.id },
      });
      shuffleArray(entries);
      return res.send({
        phase: GamePhase.READ,
        names: entries.map((elem) => elem.name),
        isHost: isHost,
      });
    } else {
      return res.send({
        phase: GamePhase.END,
        isHost: isHost,
      });
    }
  } catch (err: unknown) {
    return next(err);
  }
};

const saveEntry: ReqHandler<NamesReqBody> = async (req, res, next) => {
  try {
    if (!req.user || !req.game) return res.sendStatus(403);
    if (req.game.phase !== GamePhase.PLAY) return res.sendStatus(400);

    const name = upperFirst(req.body.text.replace(quoteRegex, '').trim());
    const normalized = name.toUpperCase();

    await prisma.nameEntry.upsert({
      where: {
        gameId_userId: {
          gameId: req.game.id,
          userId: req.user.id,
        },
      },
      update: {
        name,
        normalized,
      },
      create: {
        name,
        normalized,
        userId: req.user.id,
        gameId: req.game.id,
      },
    });
    return res.sendStatus(200);
  } catch (err: unknown) {
    return next(err);
  }
};

export const router = Router();
router.use(loadUser, loadNames);
router.get('/', joinPhase, getGameState);
router.put('/', saveEntry);
