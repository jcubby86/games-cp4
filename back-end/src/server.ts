import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import dotenv from 'dotenv';
import express from 'express';

import gameController from './controllers/games.js';
import namesController from './controllers/names.js';
import storyController from './controllers/story.js';
import userController from './controllers/users.js';
import {
  prismaErrorHandler,
  serverErrorHandler,
} from './errors/errorHandlers.js';
import { accessLogger } from './utils/accessLogger.js';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cookieSession({
    name: 'session',
    keys: ['secretValue'],
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  })
);
app.use(accessLogger);

app.use('/api/game', gameController);
app.use('/api/user', userController);
app.use('/api/story', storyController);
app.use('/api/names', namesController);

app.get('/health', async (req, res) => {
  res.sendStatus(200);
});

app.use(prismaErrorHandler, serverErrorHandler);

const runPort = process.env.NODE_PORT || 3000;
app.listen(runPort, () => console.info(`Server listening on port ${runPort}!`));

export default app;
