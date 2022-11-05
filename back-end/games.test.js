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
  });

  test('creating game fails (wrong type)', async () => {
    expect(axios.post(`${baseURL}/api/games/bad`)).rejects.toMatchObject({
      response: { data: `Invalid game type: bad`, status: 400 },
    });
  });
});
