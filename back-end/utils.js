import { getUsersInGame } from './users.js';

export const shuffleArray = (array) => {
  let curId = array.length;

  while (curId) {
    let randId = Math.floor(Math.random() * curId);
    curId -= 1;
    let tmp = array[curId];
    array[curId] = array[randId];
    array[randId] = tmp;
  }
};

export const joinPhase = async (req, res, next) => {
  try {
    if (req.game.phase === 'join') {
      const users = await getUsersInGame(req.game._id);
      return res.send({
        phase: 'join',
        users: users.map((user) => user.nickname),
        code: req.game.code,
        nickname: req.user.nickname,
      });
    }

    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

export const lowerFirst = (part) => {
  return part.slice(0, 1).toLowerCase() + part.slice(1);
};

export const upperFirst = (part) => {
  return part.slice(0, 1).toUpperCase() + part.slice(1);
};

export const getAllSubmissions = async (game, subs, createSub) => {
  if (game.phase !== 'play') return [];

  const users = await getUsersInGame(game._id);

  const allUserSet = new Set(users.map((user) => user._id.valueOf()));
  const subUserSet = new Set(subs.map((item) => item.user._id.valueOf()));

  const filteredSubs = subs.filter((elem) =>
    allUserSet.has(elem.user._id.valueOf())
  );
  const newSubs = users
    .filter((user) => !subUserSet.has(user._id.valueOf()))
    .map(createSub);

  return [...filteredSubs, ...newSubs];
};
