import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import dotenv from 'dotenv';
import express from 'express';

import { router as gameRoutes } from './games.js';
import { accessLogger } from './middleware.js';
import { router as namesRoutes } from './names.js';
import { router as storyRoutes } from './story.js';
import { router as userRoutes } from './users.js';
import { notFoundHandler, serverErrorHandler } from './utils/errorHandlers.js';

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

app.use('/api/game', gameRoutes);
app.use('/api/user', userRoutes);
app.use('/api/story', storyRoutes);
app.use('/api/names', namesRoutes);

app.get('/health', async (req, res) => {
  res.sendStatus(200);
});

app.use(notFoundHandler);
app.use(serverErrorHandler);

const runPort = process.env.NODE_PORT || 3000;
app.listen(runPort, () => console.info(`Server listening on port ${runPort}!`));
