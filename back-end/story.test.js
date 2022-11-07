const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const baseURL = `http://localhost:${process.env.NODE_PORT}`;

describe('play game with one user', () => {
  let gameCode = '';
  beforeAll(async () => {
    const response = await axios.post(`${baseURL}/api/games`, {
      type: 'story',
    });
    gameCode = response.data.code;
  });

  test('play game', async () => {
    //join game
    const userResponse = await axios.post(`${baseURL}/api/users`, {
      code: gameCode,
      nickname: 'testUser',
    });
    const cookie = userResponse.headers['set-cookie'];

    //wait for players
    let response = await axios.get(`${baseURL}/api/stories`, {
      headers: { Cookie: cookie },
    });
    expect(response).toMatchObject({
      status: 200,
      data: { phase: 'join', playerCount: 1 },
    });

    //start game
    await axios.put(`${baseURL}/api/games/${gameCode}`, { phase: 'play' });

    for (let i = 0; i < 6; i++) {
      response = await axios.get(`${baseURL}/api/stories`, {
        headers: { Cookie: cookie },
      });
      expect(response).toMatchObject({
        status: 200,
        data: { phase: 'play', round: i },
      });

      response = await axios.put(
        `${baseURL}/api/stories`,
        { part: `test${i}` },
        {
          headers: { Cookie: cookie },
        }
      );
      expect(response.status).toBe(201);
    }

    response = await axios.get(`${baseURL}/api/stories`, {
      headers: { Cookie: cookie },
    });
    expect(response).toMatchObject({
      status: 200,
      data: { phase: 'read' },
    });
  });
});

describe('play game with multiple users', () => {
  let gameCode = '';
  beforeAll(async () => {
    const response = await axios.post(`${baseURL}/api/games`, {
      type: 'story',
    });
    gameCode = response.data.code;
  });

  test('play game', async () => {
    const users = [
      { nickname: 'testUser1' },
      { nickname: 'testUser2' },
      { nickname: 'testUser3' },
      { nickname: 'testUser4' },
    ];
    //join game
    for (let i = 0; i < users.length; i++) {
      const userResponse = await axios.post(`${baseURL}/api/users`, {
        code: gameCode,
        nickname: users[i].nickname,
      });
      users[i].cookie = userResponse.headers['set-cookie'];
    }

    //wait for players
    let response = await axios.get(`${baseURL}/api/stories`, {
      headers: { Cookie: users[0].cookie },
    });
    expect(response).toMatchObject({
      status: 200,
      data: { phase: 'join', playerCount: users.length },
    });

    //start game
    await axios.put(`${baseURL}/api/games/${gameCode}`, { phase: 'play' });

    for (let i = 0; i < 6; i++) {
      //this way a random player is selected to go first each time
      const rand = Math.floor(Math.random() * users.length);
      for (let x = 0; x < users.length; x++) {
        const userNum = (x + rand) % users.length;

        response = await axios.get(`${baseURL}/api/stories`, {
          headers: { Cookie: users[userNum].cookie },
        });
        expect(response).toMatchObject({
          status: 200,
          data: { phase: 'play', round: i },
        });

        response = await axios.put(
          `${baseURL}/api/stories`,
          { part: `${users[userNum].nickname} test${i}` },
          {
            headers: { Cookie: users[userNum].cookie },
          }
        );
        expect(response.status).toBe(201);

        if (x == users.length - 1) {
          response = await axios.get(`${baseURL}/api/stories`, {
            headers: { Cookie: users[userNum].cookie },
          });
          expect(response).toMatchObject({
            status: 200,
            data: i == 5 ? { phase: 'read' } : { phase: 'play', round: i + 1 },
          });
        } else {
          response = await axios.get(`${baseURL}/api/stories`, {
            headers: { Cookie: users[userNum].cookie },
          });
          expect(response).toMatchObject({
            status: 200,
            data: { phase: 'wait', round: i },
          });
        }
      }
    }

    response = await axios.get(`${baseURL}/api/stories`, {
      headers: { Cookie: users[0].cookie },
    });
    expect(response).toMatchObject({
      status: 200,
      data: { phase: 'read' },
    });
  });
});
