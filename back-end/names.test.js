const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const baseURL = `http://localhost:${process.env.NODE_PORT}`;

jest.setTimeout(30000);

describe('play name game with one user', () => {
  let gameCode = '';
  beforeAll(async () => {
    const response = await axios.post(`${baseURL}/api/games`, {
      type: 'names',
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

    let response = await axios.get(`${baseURL}/api/names`, {
      headers: { Cookie: cookie },
    });
    expect(response.status).toBe(200);
    expect(response.data.phase).toBe('join');
    expect(response.data.users.length).toBe(1);

    //start game
    await axios.put(`${baseURL}/api/games/${gameCode}`, { phase: 'play' });

    response = await axios.get(`${baseURL}/api/names`, {
      headers: { Cookie: cookie },
    });
    expect(response.status).toBe(200);
    expect(response.data.phase).toBe('play');
    expect(response.data.users.length).toBe(1);

    response = await axios.put(
      `${baseURL}/api/names`,
      { text: 'test name' },
      {
        headers: { Cookie: cookie },
      }
    );

    response = await axios.get(`${baseURL}/api/names`, {
      headers: { Cookie: cookie },
    });
    expect(response.status).toBe(200);
    expect(response.data.phase).toBe('read');
  });
});
