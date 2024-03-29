import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import express from 'express';
import 'dotenv/config';

import gameController from './controllers/games.js';
import namesController from './controllers/names.js';
import playerController from './controllers/players.js';
import storyController from './controllers/story.js';
import suggestionController from './controllers/suggestion.js';
import userController from './controllers/users.js';
import {
  prismaErrorHandler,
  serverErrorHandler
} from './errors/errorHandlers.js';
import { accessLogger } from './utils/accessLogger.js';
import { TEST_ENV } from './utils/constants.js';
import seed from './utils/seed.js';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.COOKIE_SECRET ?? 'secretValue'],
    maxAge: 2 * 60 * 60 * 1000 // 2 hours
  }),
  (req, res, next) => {
    if (req.session) {
      req.session.nowInMinutes = Math.floor(Date.now() / 60e3);
    }
    next();
  }
);

if (process.env.NODE_ENV != TEST_ENV) {
  app.use(accessLogger);
}

app.use('/api/game', gameController);
app.use('/api/player', playerController);
app.use('/api/story', storyController);
app.use('/api/names', namesController);
app.use('/api/user', userController);
app.use('/api/suggestion', suggestionController);

app.post('/api/seed', async (req, res) => {
  await seed();
  res.sendStatus(200);
});

app.get('/health', async (req, res) => {
  res.sendStatus(200);
});

app.use(prismaErrorHandler, serverErrorHandler);

if (process.env.NODE_ENV != TEST_ENV) {
  const runPort = process.env.NODE_PORT || 3000;
  app.listen(runPort, () =>
    console.info(`Server listening on port ${runPort}!`)
  );
}

export default app;
