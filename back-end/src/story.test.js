/* eslint-disable @typescript-eslint/no-var-requires */
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const baseURL = `http://localhost:${process.env.NODE_PORT}`;

jest.setTimeout(30000);

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
      nickname: 'TestUser',
    });
    const cookie = userResponse.headers['set-cookie'];

    //wait for players
    let response = await axios.get(`${baseURL}/api/stories`, {
      headers: { Cookie: cookie },
    });
    expect(response.status).toBe(200);
    expect(response.data.phase).toBe('join');
    expect(response.data.users.length).toBe(1);

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
      { nickname: 'TestUser1' },
      { nickname: 'TestUser2' },
      { nickname: 'TestUser3' },
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
    expect(response.status).toBe(200);
    expect(response.data.phase).toBe('join');
    expect(response.data.users.length).toBe(users.length);

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
    } // end for j

    for (let i = 0; i < users.length; i++) {
      response = await axios.get(`${baseURL}/api/stories`, {
        headers: { Cookie: users[i].cookie },
      });

      expect(response.data.story.startsWith(users[i].nickname)).toBe(true);
    }
  });
});

describe('play game with one user leaving partway through', () => {
  let gameCode = '';
  beforeAll(async () => {
    const response = await axios.post(`${baseURL}/api/games`, {
      type: 'story',
    });
    gameCode = response.data.code;
  });

  test('play game', async () => {
    const users = [
      { nickname: 'TestUser1' },
      { nickname: 'TestUser2' },
      { nickname: 'TestUser3' },
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
    expect(response.status).toBe(200);
    expect(response.data.phase).toBe('join');
    expect(response.data.users.length).toBe(users.length);

    //start game
    await axios.put(`${baseURL}/api/games/${gameCode}`, { phase: 'play' });

    for (let i = 0; i < 6; i++) {
      //remove a player from the game
      if (i === 2) {
        response = await axios.delete(`${baseURL}/api/users`, {
          headers: { Cookie: users[users.length - 1].cookie },
        });
        expect(response.status).toBe(200);
        users.pop();
      }

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
    } // end for j

    for (let i = 0; i < users.length; i++) {
      response = await axios.get(`${baseURL}/api/stories`, {
        headers: { Cookie: users[i].cookie },
      });

      expect(response.data.story.startsWith(users[i].nickname)).toBe(true);
    }
  });
});
