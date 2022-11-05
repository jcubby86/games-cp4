import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import express from 'express';
import { connect } from 'mongoose';
import { router as gameRoutes } from './games.js';
import { router as userRoutes } from './users.js';

dotenv.config();

connect(process.env.MONGO_DB_CONN_STR, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

if (process.env.NODE_ENV === 'development') {
  console.info(`Connected to mongodb server ${process.env.MONGO_DB_CONN_STR}`);
}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cookieSession({
    name: 'session',
    keys: ['secretValue'],
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes);

const runPort = process.env.NODE_PORT || 3000;
app.listen(runPort, () => console.info(`Server listening on port ${runPort}!`));
