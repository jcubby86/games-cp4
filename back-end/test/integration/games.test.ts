/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';

import app from '../../src/server';

const context: any = {};

beforeAll(async () => {
  const createResponse = await request(app)
    .post('/api/game')
    .send({ type: 'name' });
  context.game = createResponse.body;
});

describe('createGame', () => {
  test('success', async () => {
    const res = await request(app).post('/api/game').send({ type: 'story' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('code');
  });

  test('should error', async () => {
    await request(app).post('/api/game').expect(500);
    await request(app).post('/api/game').send({ type: 'badType' }).expect(400);
  });
});

describe('updateGame', () => {
  test('not found', async () => {
    await request(app).put(`/api/game/CODE`).send({ phase: 'end' }).expect(404);
  });

  test('success', async () => {
    const updateResponse = await request(app)
      .put(`/api/game/${context.game.uuid}`)
      .send({ phase: 'end' });
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.uuid).toMatch(context.game.uuid);
    expect(updateResponse.body.phase).toMatch('END');

    await request(app)
    .put(`/api/game/${context.game.uuid}`)
    .send({ phase: 'WHAT' }).expect(400);
  });
});

describe('getGame', () => {
  test('not found', async () => {
    await request(app).get('/api/game/CODE').expect(404);
  });

  test('success', async () => {
    const getResponse = await request(app).get(
      `/api/game/${context.game.code}`
    );
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body.uuid).toMatch(context.game.uuid);
  });
});

describe('recreateGame', () => {
  test('not found', async () => {
    await request(app).post('/api/game/UUID/recreate').expect(404);
  });

  test('success', async () => {
    const response1 = await request(app).post(
      `/api/game/${context.game.uuid}/recreate`
    );
    expect(response1.statusCode).toBe(200);

    const response2 = await request(app).post(
      `/api/game/${context.game.uuid}/recreate`
    );
    expect(response2.statusCode).toBe(200);

    expect(response1.body).toMatchObject(response2.body);
  });
});
