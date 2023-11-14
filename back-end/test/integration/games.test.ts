import { describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';

import app from '../../src/server';

describe('createGame', () => {
  test('should get OK', async () => {
    const res = await request(app).post('/api/game').send({ type: 'story' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('code');
  });

  test('should error', async () => {
    await request(app).post('/api/game').expect(500);
    await request(app).post('/api/game').send({ type: 'badType' }).expect(500);
  });
});

describe('updateGame', () => {
  test('should get OK', async () => {
    const createResponse = await request(app)
      .post('/api/game')
      .send({ type: 'story' });
    expect(createResponse.body.phase).toMatch('JOIN');

    const updateResponse = await request(app)
      .put(`/api/game/${createResponse.body.uuid}`)
      .send({ phase: 'end' });
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.uuid).toMatch(createResponse.body.uuid);
    expect(updateResponse.body.phase).toMatch('END');
  });
});
