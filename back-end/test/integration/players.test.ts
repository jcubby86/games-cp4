/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeAll, describe, expect, test } from '@jest/globals';
import request, { agent as requestAgent } from 'supertest';

import app from '../../src/server';

describe('single player', () => {
  const agent = requestAgent(app);
  const context: any = {};
  beforeAll(async () => {
    const createResponse = await requestAgent(app)
      .post('/api/game')
      .send({ type: 'name' });
    context.game = createResponse.body;
  });

  test('join', async () => {
    const playerResponse = await agent
      .post('/api/player')
      .send({ uuid: context.game.uuid, nickname: 'test' });
    expect(playerResponse.status).toBe(200);
    expect(playerResponse.body.nickname).toMatch('test');
    expect(playerResponse.body.game).toMatchObject({
      code: context.game.code,
      uuid: context.game.uuid
    });
    expect(playerResponse.headers['set-cookie']).not.toBeUndefined();
    expect(playerResponse.body.game.hostId).toEqual(playerResponse.body.id);
  });

  test('getGame', async () => {
    const playerResponse = await agent.get('/api/player');
    expect(playerResponse.status).toBe(200);
    expect(playerResponse.body.nickname).toMatch('test');
  });

  test('rejoinGame', async () => {
    const playerResponse = await agent
      .post('/api/player')
      .send({ uuid: context.game.uuid, nickname: 'test' });
    expect(playerResponse.status).toBe(200);
    expect(playerResponse.body.nickname).toMatch('test');
    expect(playerResponse.body.game).toMatchObject({
      code: context.game.code,
      uuid: context.game.uuid
    });
    expect(playerResponse.headers['set-cookie']).not.toBeUndefined();
  });

  test('leaveGame', async () => {
    await agent.delete('/api/player').expect(200);
  });
});

describe('multiple players', () => {
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
    const player1 = await agent1
      .post('/api/player')
      .send({ uuid: context.game.uuid, nickname: 'test1' })
      .expect(200);
    expect(player1.body.game.hostId).toEqual(player1.body.id);

    let player2 = await agent2
      .post('/api/player')
      .send({ uuid: context.game.uuid, nickname: 'test2' })
      .expect(200);
    expect(player2.body.game.hostId).toEqual(player1.body.id);

    await agent1.delete('/api/player').expect(200);

    player2 = await agent2.get('/api/player').expect(200);
    expect(player2.body.game.hostId).toEqual(player2.body.id);
  });

  test('conflicting nicknames', async () => {
    await agent1
      .post('/api/player')
      .send({ uuid: context.game.uuid, nickname: 'test' })
      .expect(200);
    await agent1
      .post('/api/player')
      .send({ uuid: context.game.uuid, nickname: 'test' })
      .expect(200);

    await agent2
      .post('/api/player')
      .send({ uuid: context.game.uuid, nickname: 'test' })
      .expect(400);
  });
});

test('game not found', async () => {
  await request(app)
    .post('/api/player')
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
    .post('/api/player')
    .send({ uuid: newGame.body.uuid, nickname: 'test' })
    .expect(400);
});

test('closed game - join before closing', async () => {
  const agent = requestAgent(app);
  const newGame = await agent.post('/api/game').send({ type: 'name' });
  await agent
    .post('/api/player')
    .send({ uuid: newGame.body.uuid, nickname: 'test' })
    .expect(200);

  await agent.put(`/api/game/${newGame.body.uuid}`).send({ phase: 'end' });
  await agent
    .post('/api/player')
    .send({ uuid: newGame.body.uuid, nickname: 'test' })
    .expect(200);
});

test('leaveGame - no player', async () => {
  await request(app).delete('/api/player').expect(200);
});

test('getPlayer - no player', async () => {
  await request(app).get('/api/player').expect(404);
});
