/* eslint-disable @typescript-eslint/no-var-requires */
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const baseURL = `http://localhost:${process.env.NODE_PORT}`;

describe('joining valid game', () => {
  let gameCode = '';
  beforeAll(async () => {
    const response = await axios.post(`${baseURL}/api/games`, {
      type: 'story',
    });
    gameCode = response.data.code;
  });

  test('create a single user', async () => {
    const response = await axios.post(`${baseURL}/api/users`, {
      code: gameCode,
      nickname: 'testUser',
    });

    expect(response.status).toBe(201);
    expect(response.data.nickname).toBe('testUser');
    expect(response.data.game).not.toBeNull();
    expect(response.data.game.code).not.toBeNull();
  });

  test('create two valid users in one game', async () => {
    expect(
      axios.post(`${baseURL}/api/users`, {
        code: gameCode,
        nickname: 'testUser5',
      })
    ).resolves.toMatchObject({ status: 201, data: { nickname: 'testUser5' } });

    expect(
      axios.post(`${baseURL}/api/users`, {
        code: gameCode,
        nickname: 'testUser6',
      })
    ).resolves.toMatchObject({ status: 201, data: { nickname: 'testUser6' } });
  });

  test('join nonexistent game', async () => {
    expect(
      axios.post(`${baseURL}/api/users`, { code: '1234', nickname: 'testUser' })
    ).rejects.toThrow(axios.AxiosError);
  });

  test('create a new user with duplicate nickname', async () => {
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

  test('get user from cookie', async () => {
    const response = await axios.post(`${baseURL}/api/users`, {
      code: gameCode,
      nickname: 'testUser3',
    });

    expect(response.status).toBe(201);

    const response2 = await axios.get(`${baseURL}/api/users`, {
      headers: { Cookie: response.headers['set-cookie'] },
    });
    expect(response2.status).toBe(200);
    expect(response.data.nickname).toBe('testUser3');
  });

  test('same user rejoins game', async () => {
    const response = await axios.post(`${baseURL}/api/users`, {
      code: gameCode,
      nickname: 'testUser4',
    });

    expect(response.status).toBe(201);

    const response2 = await axios.post(
      `${baseURL}/api/users`,
      {
        code: gameCode,
        nickname: 'testUser4',
      },
      {
        headers: { Cookie: response.headers['set-cookie'] },
      }
    );
    expect(response2.status).toBe(200);
    expect(response2.data.nickname).toBe('testUser4');
  });

  test('same user changes nickname', async () => {
    const response = await axios.post(`${baseURL}/api/users`, {
      code: gameCode,
      nickname: 'testUser7',
    });

    expect(response.status).toBe(201);

    const response2 = await axios.post(
      `${baseURL}/api/users`,
      {
        code: gameCode,
        nickname: 'testUser8',
      },
      {
        headers: { Cookie: response.headers['set-cookie'] },
      }
    );
    expect(response2.status).toBe(200);
    expect(response2.data.nickname).toBe('testUser8');
    expect(response2.data._id).toBe(response.data._id);
  });
});

describe('trying to join game that has already started', () => {
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

  test('user rejoining', async () => {
    const response = await axios.post(
      `${baseURL}/api/users`,
      {
        code: gameCode,
        nickname: 'testUser',
      },
      {
        headers: { Cookie: cookie },
      }
    );
    expect(response).toMatchObject({ status: 200 });
  });

  test('new user tries to join', async () => {
    expect(
      axios.post(`${baseURL}/api/users`, {
        code: gameCode,
        nickname: 'testUser2',
      })
    ).rejects.toMatchObject({
      response: {
        data: `Game with code ${gameCode} does not exist or can no longer be joined.`,
        status: 400,
      },
    });
  });
});

describe('read list of users from game', () => {
  let gameCode = '';
  beforeAll(async () => {
    const response = await axios.post(`${baseURL}/api/games`, {
      type: 'story',
    });
    gameCode = response.data.code;

    await axios.post(`${baseURL}/api/users`, {
      code: gameCode,
      nickname: 'testUser',
    });
    await axios.post(`${baseURL}/api/users`, {
      code: gameCode,
      nickname: 'testUser2',
    });
    await axios.post(`${baseURL}/api/users`, {
      code: gameCode,
      nickname: 'testUser3',
    });
    await axios.post(`${baseURL}/api/users`, {
      code: gameCode,
      nickname: 'testUser4',
    });
  });

  test('get user count', async () => {
    const response = await axios.get(`${baseURL}/api/users/${gameCode}`);
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(4);
  });
});
