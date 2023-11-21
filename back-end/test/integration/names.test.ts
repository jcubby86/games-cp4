/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeAll, describe, expect, test } from '@jest/globals';
import { agent as requestAgent } from 'supertest';

import { GamePhase } from '../../src/.generated/prisma';
import app from '../../src/server';
import { WAIT } from '../../src/utils/constants';

describe('single user', () => {
  const agent = requestAgent(app);
  const context: any = {};
  beforeAll(async () => {
    const createResponse = await agent.post('/api/game').send({ type: 'name' });
    await agent
      .post('/api/user')
      .send({ uuid: createResponse.body.uuid, nickname: 'nametest' });

    context.game = createResponse.body;
  });

  test('join phase', async () => {
    const response = await agent.get('/api/names').expect(200);
    expect(response.body).toMatchObject({
      phase: GamePhase.JOIN,
      users: ['nametest'],
      isHost: true
    });
  });

  test('play phase', async () => {
    await agent.put(`/api/names`).send({ value: 'test entry 1' }).expect(400);
    await agent.put(`/api/game/${context.game.uuid}`).send({ phase: 'play' });

    const response = await agent.get('/api/names').expect(200);
    expect(response.body).toMatchObject({
      phase: GamePhase.PLAY,
      users: ['nametest']
    });
  });

  test('submit entry', async () => {
    await agent.put(`/api/names`).expect(400);
    await agent.put(`/api/names`).send({ value: 'test entry' });

    const response = await agent.get('/api/names').expect(200);
    expect(response.body).toMatchObject({
      phase: GamePhase.READ,
      names: ['Test entry']
    });
  });

  test('end phase', async () => {
    await agent.put(`/api/game/${context.game.uuid}`).send({ phase: 'end' });

    const response = await agent.get('/api/names').expect(200);
    expect(response.body).toMatchObject({
      phase: GamePhase.END
    });
  });
});

describe('multiple users', () => {
  const agent1 = requestAgent(app);
  const agent2 = requestAgent(app);
  const context: any = {};
  beforeAll(async () => {
    const createResponse = await agent1
      .post('/api/game')
      .send({ type: 'name' });
    await agent1
      .post('/api/user')
      .send({ uuid: createResponse.body.uuid, nickname: 'nametest1' });
    await agent2
      .post('/api/user')
      .send({ uuid: createResponse.body.uuid, nickname: 'nametest2' });

    context.game = createResponse.body;
  });

  test('join phase', async () => {
    await agent1
      .get('/api/names')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.JOIN,
          isHost: true
        });
        expect(response.body.users).toEqual(
          expect.arrayContaining(['nametest1', 'nametest2'])
        );
      });
    await agent2
      .get('/api/names')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.JOIN,
          isHost: false
        });
        expect(response.body.users).toEqual(
          expect.arrayContaining(['nametest1', 'nametest2'])
        );
      });
  });

  test('submit first entry', async () => {
    await agent1.put(`/api/game/${context.game.uuid}`).send({ phase: 'play' });
    await agent1.put(`/api/names`).send({ value: 'test entry 1' });

    await agent1
      .get('/api/names')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: WAIT
        });
      });

    await agent2
      .get('/api/names')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.PLAY
        });
      });
  });

  test('submit second entry', async () => {
    await agent2.put(`/api/names`).send({ value: 'test entry 2' });

    await agent1
      .get('/api/names')
      .expect(200)
      .then((response) => {
        expect(response.body.phase).toEqual(GamePhase.READ);
        expect(response.body.names).toEqual(
          expect.arrayContaining(['Test entry 1', 'Test entry 2'])
        );
      });

    await agent2
      .get('/api/names')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.READ
        });
      });
  });

  test('end phase', async () => {
    await agent1.put(`/api/game/${context.game.uuid}`).send({ phase: 'end' });

    await agent1
      .get('/api/names')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.END
        });
      });
    await agent2
      .get('/api/names')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.END
        });
      });
  });
});

describe('multiple users - leaving partway through', () => {
  const agent1 = requestAgent(app);
  const agent2 = requestAgent(app);
  const context: any = {};
  beforeAll(async () => {
    const createResponse = await agent1
      .post('/api/game')
      .send({ type: 'name' });
    await agent1
      .post('/api/user')
      .send({ uuid: createResponse.body.uuid, nickname: 'nametest1' });
    await agent2
      .post('/api/user')
      .send({ uuid: createResponse.body.uuid, nickname: 'nametest2' });

    context.game = createResponse.body;
  });

  test('join phase', async () => {
    await agent1
      .get('/api/names')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.JOIN,
          isHost: true
        });
        expect(response.body.users).toEqual(
          expect.arrayContaining(['nametest1', 'nametest2'])
        );
      });
    await agent2
      .get('/api/names')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.JOIN,
          isHost: false
        });
        expect(response.body.users).toEqual(
          expect.arrayContaining(['nametest1', 'nametest2'])
        );
      });
  });

  test('submit first entry', async () => {
    await agent1.put(`/api/game/${context.game.uuid}`).send({ phase: 'play' });
    await agent1.put(`/api/names`).send({ value: 'test entry 1' }).expect(200);

    await agent1
      .get('/api/names')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: WAIT
        });
      });

    await agent2
      .get('/api/names')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.PLAY
        });
      });
  });

  test('resubmit first', async () => {
    await agent1
      .put(`/api/names`)
      .send({ value: 'resubmit entry 1' })
      .expect(200);

    await agent1
      .get('/api/names')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: WAIT
        });
      });
  });

  test('second user leaves', async () => {
    await agent2.delete(`/api/user`);

    await agent1
      .get('/api/names')
      .expect(200)
      .then((response) => {
        expect(response.body.phase).toEqual(GamePhase.READ);
        expect(response.body.names).toEqual(['Resubmit entry 1']);
      });

    await agent2.get('/api/names').expect(403);
  });

  test('end phase', async () => {
    await agent1.put(`/api/game/${context.game.uuid}`).send({ phase: 'end' });

    await agent1
      .get('/api/names')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.END
        });
      });
  });
});
