import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import express from 'express';
import { connect } from 'mongoose';

dotenv.config();

connect(process.env.MONGO_DB_CONN_STRING, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: [
    'secretValue'
  ],
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));


import { router as gameRoutes } from "./games.js";
app.use("/api/games", gameRoutes);

import { router as userRoutes } from "./users.js";
app.use("/api/users", userRoutes);

app.listen(process.env.NODE_PORT || 3000, () => console.log(`Server listening on port ${process.env.NODE_PORT || 3000}!`));