import { Router } from 'express';
import { Schema, model } from 'mongoose';

export const router = Router();

const gameSchema = new Schema({
  type: String,
  code: String,
  phase: String,
});

export const GameModel = model('Game', gameSchema);

const validGameTypes = ['story'];

const getCode = async () => {
  while (true) {
    let c = Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substring(0, 4);
    let search = await GameModel.findOne({ code: c });
    if (!search) {
      return c;
    }
  }
};

router.post('/', async (req, res) => {
  try {
    if (!validGameTypes.includes(req.body.type)) {
      console.warn(`Invalid game type: ${req.body.type}`);
      return res.status(400).send(`Invalid game type: ${req.body.type}`);
    }

    const newCode = await getCode();
    const game = new GameModel({
      type: req.body.type,
      code: newCode,
      phase: 'join',
    });

    await game.save();
    console.info('Game created:', JSON.stringify(game));
    return res.status(201).send(game);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.get('/:code', async (req, res) => {
  try {
    const game = await GameModel.findOne({ code: req.params.code });
    if (!game) {
      return res.sendStatus(404);
    }

    res.send(game);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.put('/:code', async (req, res) => {
  try {
    const game = await GameModel.findOne({ code: req.params.code });
    if (!game) {
      return res.sendStatus(404);
    }

    game.phase = req.body.phase;
    await game.save();

    console.info('Game updated:', JSON.stringify(game));
    res.send(game);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});
