import { Router } from 'express';

import { Category, Game, GamePhase } from './.generated/prisma';
import { NamesRequestBody, NamesResponseBody } from './domain/types.js';
import { joinPhase, loadNames, loadUser } from './middleware.js';
import prisma from './server.js';
import { WAIT, quoteRegex } from './utils/constants.js';
import { RequestBody, RequestHandler } from './utils/types.js';
import {
  getEntryForGame,
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
    include: { nameEntries: true },
  });

  const waitingOnUsers = users
    .filter((u) => getEntryForGame(game.id, u.nameEntries) === undefined)
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

const getGameState: RequestHandler<RequestBody, NamesResponseBody> = async (
  req,
  res,
  next
) => {
  try {
    if (!req.game || !req.user || !req.nameEntries) return res.sendStatus(500);

    const entries = req.nameEntries;
    const waitingOnUsers = await checkCompletion(req.game);
    const isHost = req.game.hostId === req.user.id;

    if (req.game.phase === GamePhase.PLAY) {
      const userElem = entries.find((elem) => elem.userId === req.user?.id);

      const category = randomElement(categories);
      const suggestion = await getSuggestion(category);
      return res.send({
        phase: !userElem ? GamePhase.PLAY : WAIT,
        users: waitingOnUsers,
        text: userElem?.name,
        placeholder: suggestion,
      });
    } else if (req.game.phase === GamePhase.READ) {
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

const saveEntry: RequestHandler<NamesRequestBody> = async (req, res, next) => {
  try {
    if (!req.game || !req.user || !req.nameEntries) return res.sendStatus(500);

    if (req.game.phase !== GamePhase.PLAY) return res.sendStatus(403);

    const names = req.nameEntries;

    const userIndex = names.findIndex((elem) => elem.userId === req.user?.id);
    if (userIndex === -1) {
      const name = upperFirst(req.body.text.replace(quoteRegex, '').trim());
      const normalized = name.toUpperCase();

      await prisma.nameEntry.create({
        data: {
          name: name,
          normalized: normalized,
          user: { connect: { id: req.user.id } },
          game: { connect: { id: req.game.id } },
        },
      });
      return res.sendStatus(201);
    } else {
      res.sendStatus(200);
    }
  } catch (err: unknown) {
    return next(err);
  }
};

export const router = Router();
router.use(loadUser, loadNames);
router.get('/', joinPhase, getGameState);
router.put('/', saveEntry);
