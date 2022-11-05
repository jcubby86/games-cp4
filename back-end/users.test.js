const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const baseURL = `http://localhost:${process.env.NODE_PORT}`;

describe('creating a single user', () => {
  let gameCode = '';
  beforeAll(async () => {
    const response = await axios.post(`${baseURL}/api/games/story`);
    gameCode = response.data.code;
  });

  test('create a user', async () => {
    const response = await axios.post(`${baseURL}/api/users`, {
      code: gameCode,
      nickname: 'testUser',
    });

    expect(response.status).toBe(201);
    expect(response.data.nickname).toBe('testUser');
    expect(response.data.game).not.toBeNull();
    expect(response.data.game.code).not.toBeNull();
  });

  test('join nonexistent game', async () => {
    expect(
      axios.post(`${baseURL}/api/users`, { code: '1234', nickname: 'testUser' })
    ).rejects.toThrow(axios.AxiosError);
  });

  test('create a user with duplicate nickname', async () => {
    const response = await axios.post(`${baseURL}/api/users`, {
      code: gameCode,
      nickname: 'testUser2',
    });

    expect(response.status).toBe(201);

    expect(
      axios.post(`${baseURL}/api/users`, {
        code: gameCode,
        nickname: 'testUser2',
      })
    ).rejects.toMatchObject({
      response: {
        data: `The nickname testUser2 is already taken`,
        status: 400,
      },
    });
  });
});
