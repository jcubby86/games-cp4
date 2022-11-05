const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const baseURL = `http://localhost:${process.env.NODE_PORT}`;

describe('get stories in join phase', () => {
  let gameCode = '';
  beforeAll(async () => {
    const response = await axios.post(`${baseURL}/api/games`, {
      type: 'story',
    });
    gameCode = response.data.code;
  });

  test('get stories', async () => {
    const userResponse = await axios.post(`${baseURL}/api/users`, {
      code: gameCode,
      nickname: 'testUser',
    });
    const cookie = userResponse.headers['set-cookie'];

    const response = await axios.get(`${baseURL}/api/stories`, {
      headers: { Cookie: cookie },
    });
    expect(response).toMatchObject({
      status: 200,
      data: { phase: 'join', playerCount: 1 },
    });
  });
});

describe('get stories in play phase', () => {
  let gameCode = '';
  let cookie = {};
  beforeAll(async () => {
    const response = await axios.post(`${baseURL}/api/games`, {
      type: 'story',
    });
    gameCode = response.data.code;

    const userResponse = await axios.post(`${baseURL}/api/users`, {
      code: gameCode,
      nickname: 'testUser',
    });
    cookie = userResponse.headers['set-cookie'];

    await axios.put(`${baseURL}/api/games/${gameCode}`, { phase: 'play' });
  });

  test('get stories', async () => {
    const response = await axios.get(`${baseURL}/api/stories`, {
      headers: { Cookie: cookie },
    });
    expect(response).toMatchObject({
      status: 200,
      data: { phase: 'play', round: 1 },
    });
  });
});
