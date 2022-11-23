import { getUsersInGame } from './users.js';

export const shuffleArray = (array) => {
  let curId = array.length;
  // There remain elements to shuffle
  while (0 !== curId) {
    // Pick a remaining element
    let randId = Math.floor(Math.random() * curId);
    curId -= 1;
    // Swap it with the current element.
    let tmp = array[curId];
    array[curId] = array[randId];
    array[randId] = tmp;
  }
  return array;
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
