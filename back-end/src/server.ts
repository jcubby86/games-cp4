import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import express from 'express';
import { connect } from 'mongoose';
import { router as gameRoutes } from './games.js';
import { router as userRoutes } from './users.js';
import { router as storyRoutes } from './story.js';
import { router as namesRoutes } from './names.js';
import {
  router as suggestionRoutes,
  seed as seedSuggestions,
} from './suggestions.js';
import { Seed } from './types';
import { SeedModel } from './models.js';

dotenv.config();

if (!process.env.MONGO_DB_CONN_STR) {
  console.error('Connection string for MongoDB not found');
  process.exit(1);
}

connect(process.env.MONGO_DB_CONN_STR);
console.info(`Connected to mongodb server ${process.env.MONGO_DB_CONN_STR}`);

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
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  next();
});

app.use('/api/game', gameRoutes);
app.use('/api/user', userRoutes);
app.use('/api/story', storyRoutes);
app.use('/api/names', namesRoutes);
app.use('/api/suggestions', suggestionRoutes);

app.get('/api/health', async (req, res) => {
  res.sendStatus(200);
});

app.post('/api/seed', async (req, res) => {
  try {
    const updated: Seed[] = [];
    await seedSuggestions(updated);
    return res
      .status(updated.length ? 201 : 200)
      .send(updated.map((x) => ({ table: x.table, isSeeded: x.isSeeded })));
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

app.get('/api/seed', async (req, res) => {
  try {
    const seeds = await SeedModel.find();
    return res.send(
      seeds.map((x) => ({ table: x.table, isSeeded: x.isSeeded }))
    );
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

const runPort = process.env.NODE_PORT || 3000;
app.listen(runPort, () => console.info(`Server listening on port ${runPort}!`));
