const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const baseURL = `http://localhost:${process.env.NODE_PORT}`;

describe('creating games', () => {
  test('create a game (story)', async () => {
    const response = await axios.post(`${baseURL}/api/games/story`);

    expect(response.status).toBe(201);
    expect(response.data.type).toBe('story');
    expect(response.data.phase).toBe('join');

    //TODO: don't rely on api
    const response2 = await axios.get(
      `${baseURL}/api/games/${response.data.code}`
    );
    expect(response2.status).toBe(200);
    expect(response2.data).not.toBeNull();
  });
});
