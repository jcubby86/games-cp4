import { Router, Request, Response } from 'express';
import { SeedModel, SuggestionModel } from './models.js';
import { ISuggestion, Seed } from './types.js';

import male_names from './suggestion/male_names.js';
import female_names from './suggestion/female_names.js';
import actions_past from './suggestion/actions_past.js';
import actions_present from './suggestion/actions_present.js';
import statements from './suggestion/statements.js';
import {
  ACTIONS_PAST,
  ACTIONS_PRESENT,
  FEMALE_NAMES,
  MALE_NAMES,
  STATEMENTS,
} from './helpers/constants.js';

export const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const suggestion = new SuggestionModel({
      value: req.body.value,
      category: req.body.category,
    });

    await suggestion.save();
    return res.status(201).send(suggestion);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.post('/seed', async (req: Request, res: Response) => {
  try {
    let seed: Seed | null = await SeedModel.findOne({ table: 'Suggestion' });
    if (seed?.isSeeded) return res.sendStatus(200);

    const suggestions: ISuggestion[] = [
      ...male_names.map((x) => ({ value: x, category: MALE_NAMES })),
      ...female_names.map((x) => ({ value: x, category: FEMALE_NAMES })),
      ...actions_past.map((x) => ({ value: x, category: ACTIONS_PAST })),
      ...actions_present.map((x) => ({ value: x, category: ACTIONS_PRESENT })),
      ...statements.map((x) => ({ value: x, category: STATEMENTS })),
    ];
    SuggestionModel.create(suggestions);

    if (seed === null) {
      seed = new SeedModel({ table: 'Suggestion', isSeeded: true });
    } else {
      seed.isSeeded = true;
    }
    await seed.save();
    return res.sendStatus(201);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.get('/seed', async (req: Request, res: Response) => {
  try {
    const seed = await SeedModel.findOne({ table: 'Suggestion' });
    if (seed != null && seed != undefined && seed.isSeeded) {
      return res.send({ table: seed.table, isSeeded: seed.isSeeded });
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.get('/', async(req: Request, res: Response) => {
try {
    const suggestions: ISuggestion[] = await SuggestionModel.find();
    return res.send(suggestions.map(x => ({value: x.value, category: x.category})));
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});