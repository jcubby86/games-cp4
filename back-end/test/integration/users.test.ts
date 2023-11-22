/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeAll, describe, expect, test } from '@jest/globals';
import request, { agent as requestAgent } from 'supertest';

import app from '../../src/server';

describe('single user', () => {
  const agent = requestAgent(app);
  const context: any = {};
  beforeAll(async () => {
    const createResponse = await requestAgent(app)
      .post('/api/game')
      .send({ type: 'name' });
    context.game = createResponse.body;
  });

  test('join', async () => {
    const userResponse = await agent
      .post('/api/user')
      .send({ uuid: context.game.uuid, nickname: 'test' });
    expect(userResponse.status).toBe(200);
    expect(userResponse.body.nickname).toMatch('test');
    expect(userResponse.body.game).toMatchObject({
      code: context.game.code,
      uuid: context.game.uuid
    });
    expect(userResponse.headers['set-cookie']).not.toBeUndefined();
    expect(userResponse.body.game.hostId).toEqual(userResponse.body.id);
  });

  test('getGame', async () => {
    const userResponse = await agent.get('/api/user');
    expect(userResponse.status).toBe(200);
    expect(userResponse.body.nickname).toMatch('test');
  });

  test('rejoinGame', async () => {
    const userResponse = await agent
      .post('/api/user')
      .send({ uuid: context.game.uuid, nickname: 'test' });
    expect(userResponse.status).toBe(200);
    expect(userResponse.body.nickname).toMatch('test');
    expect(userResponse.body.game).toMatchObject({
      code: context.game.code,
      uuid: context.game.uuid
    });
    expect(userResponse.headers['set-cookie']).not.toBeUndefined();
  });

  test('leaveGame', async () => {
    await agent.delete('/api/user').expect(200);
  });
});

describe('multiple users', () => {
  const agent1 = requestAgent(app);
  const agent2 = requestAgent(app);
  const context: any = {};
  beforeAll(async () => {
    const createResponse = await requestAgent(app)
      .post('/api/game')
      .send({ type: 'name' });
    context.game = createResponse.body;
  });

  test('joining and leaving', async () => {
    const user1 = await agent1
      .post('/api/user')
      .send({ uuid: context.game.uuid, nickname: 'test1' })
      .expect(200);
    expect(user1.body.game.hostId).toEqual(user1.body.id);

    let user2 = await agent2
      .post('/api/user')
      .send({ uuid: context.game.uuid, nickname: 'test2' })
      .expect(200);
    expect(user2.body.game.hostId).toEqual(user1.body.id);

    await agent1.delete('/api/user').expect(200);

    user2 = await agent2.get('/api/user').expect(200);
    expect(user2.body.game.hostId).toEqual(user2.body.id);
  });

  test('conflicting nicknames', async () => {
    await agent1
      .post('/api/user')
      .send({ uuid: context.game.uuid, nickname: 'test' })
      .expect(200);
    await agent1
      .post('/api/user')
      .send({ uuid: context.game.uuid, nickname: 'test' })
      .expect(200);

    await agent2
      .post('/api/user')
      .send({ uuid: context.game.uuid, nickname: 'test' })
      .expect(400);
  });
});

test('game not found', async () => {
  await request(app)
    .post('/api/user')
    .send({ uuid: 'UUID', nickname: 'test' })
    .expect(400);
});

test('closed game - join after closing', async () => {
  const newGame = await request(app).post('/api/game').send({ type: 'name' });
  await request(app)
    .put(`/api/game/${newGame.body.uuid}`)
    .send({ phase: 'end' })
    .expect(200);
  await request(app)
    .post('/api/user')
    .send({ uuid: newGame.body.uuid, nickname: 'test' })
    .expect(400);
});

test('closed game - join before closing', async () => {
  const agent = requestAgent(app);
  const newGame = await agent.post('/api/game').send({ type: 'name' });
  await agent
    .post('/api/user')
    .send({ uuid: newGame.body.uuid, nickname: 'test' })
    .expect(200);

  await agent.put(`/api/game/${newGame.body.uuid}`).send({ phase: 'end' });
  await agent
    .post('/api/user')
    .send({ uuid: newGame.body.uuid, nickname: 'test' })
    .expect(200);
});

test('leaveGame - no user', async () => {
  await request(app).delete('/api/user').expect(200);
});

test('getUser - no user', async () => {
  await request(app).get('/api/user').expect(404);
});
