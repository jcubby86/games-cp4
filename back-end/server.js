import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import express from 'express';
import { connect } from 'mongoose';
import { router as gameRoutes } from './games.js';
import { router as userRoutes } from './users.js';
import { router as storyRoutes } from './story.js';
import { router as namesRoutes } from './names.js';

dotenv.config();

if (!process.env.MONGO_DB_CONN_STR) {
  console.error('Connection string for MongoDB not found');
  process.exit(1);
}

connect(process.env.MONGO_DB_CONN_STR, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
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

// app.use((req, res, next) => {
//   console.log(req.originalUrl);
//   next();
// });

app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/names', namesRoutes);

const runPort = process.env.NODE_PORT || 3001;
app.listen(runPort, () => console.info(`Server listening on port ${runPort}!`));
