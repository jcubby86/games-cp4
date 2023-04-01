/* eslint-disable @typescript-eslint/no-var-requires */
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const baseURL = `http://localhost:${process.env.NODE_PORT}`;

describe('creating games', () => {
  test('create a game (story)', async () => {
    const response = await axios.post(`${baseURL}/api/game`, {
      type: 'story',
    });

    expect(response.status).toBe(201);
    expect(response.data.type).toBe('story');
    expect(response.data.phase).toBe('join');
  });

  test('creating game fails (wrong type)', async () => {
    expect(
      axios.post(`${baseURL}/api/game`, { type: 'bad' })
    ).rejects.toMatchObject({
      response: { status: 500 },
    });
  });

  test('get nonexistent game fails', async () => {
    expect(axios.get(`${baseURL}/api/game/1234`)).rejects.toMatchObject({
      response: { status: 404 },
    });
  });

  test('update game succeeds', async () => {
    const response = await axios.post(`${baseURL}/api/game`, {
      type: 'story',
    });
    expect(response).toMatchObject({ status: 201, data: { phase: 'join' } });

    expect(
      axios.put(`${baseURL}/api/game/${response.data.code}`, { phase: 'end' })
    ).resolves.toMatchObject({ status: 200, data: { phase: 'end' } });
  });
});
