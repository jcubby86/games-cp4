import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import express from 'express';
import { router as gameRoutes } from './games.js';
import { router as userRoutes } from './users.js';
import { router as storyRoutes } from './story.js';
import { router as namesRoutes } from './names.js';
import { PrismaClient } from './.generated/prisma';

dotenv.config();
const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

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

app.use((req, res, next) => {
  res.on('finish', () => {
    if (req.originalUrl.endsWith('/health')) return;
    console.log(
      `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${
        res.statusCode
      }`
    );
  });
  next();
});

app.use('/api/game', gameRoutes);
app.use('/api/user', userRoutes);
app.use('/api/story', storyRoutes);
app.use('/api/names', namesRoutes);

app.get('/health', async (req, res) => {
  res.sendStatus(200);
});

const runPort = process.env.NODE_PORT || 3000;
app.listen(runPort, () => console.info(`Server listening on port ${runPort}!`));

export default prisma;
