import { Router } from 'express';
import { NamesModel } from './models.js';
import { loadUser } from './users.js';
import { joinPhase, getAllSubmissions } from './utils.js';

export const createNames = async (game) => {
  const names = new NamesModel({
    game: game._id,
    names: [],
  });
  await names.save();
};

const loadNames = async (req, res, next) => {
  if (!req.user || !req.game) return res.sendStatus(401);
  if (req.game.type !== 'names') return res.sendStatus(400);

  req.namesType = await NamesModel.findOne({ game: req.game._id }).populate(
    'names.user'
  );
  if (!req.namesType) return res.sendStatus(400);
  next();
};

export const router = Router();
router.use(loadUser, loadNames);

router.get('/', joinPhase, async (req, res) => {
  try {
    //
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});
