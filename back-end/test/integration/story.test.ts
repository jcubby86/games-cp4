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
    const createResponse = await agent
      .post('/api/game')
      .send({ type: 'story' });
    await agent
      .post('/api/user')
      .send({ uuid: createResponse.body.uuid, nickname: 'storyTest' });

    context.game = createResponse.body;
  });

  test('join phase', async () => {
    const response = await agent.get('/api/story').expect(200);
    expect(response.body).toMatchObject({
      phase: GamePhase.JOIN,
      users: ['storyTest'],
      isHost: true
    });
  });

  test('play phase', async () => {
    await agent.put(`/api/story`).send({ part: 'test entry' }).expect(400);
    await agent.put(`/api/game/${context.game.uuid}`).send({ phase: 'play' });

    const response = await agent.get('/api/story').expect(200);
    expect(response.body).toMatchObject({
      phase: GamePhase.PLAY,
      users: ['storyTest']
    });
  });

  test('submit entry - round 1', async () => {
    await agent.put(`/api/story`).expect(400);
    await agent.put(`/api/story`).send({ part: 'round 1' }).expect(200);

    const response = await agent.get('/api/story').expect(200);
    expect(response.body).toMatchObject({
      phase: GamePhase.PLAY,
      round: 1
    });
  });

  test('submit entry - remaining rounds', async () => {
    await agent.put(`/api/story`).send({ part: 'round 2' }).expect(200);
    await agent.put(`/api/story`).send({ part: 'round 3' }).expect(200);
    await agent.put(`/api/story`).send({ part: 'round 4' }).expect(200);
    await agent.put(`/api/story`).send({ part: 'round 5' }).expect(200);
    await agent.put(`/api/story`).send({ part: 'round 6' }).expect(200);

    const response = await agent.get('/api/story').expect(200);
    expect(response.body).toMatchObject({
      phase: GamePhase.READ,
      story:
        'Round 1 and Round 2 were round 3. He said, "Round 4." She said, "Round 5." So they round 6. '
    });
  });

  test('get archive', async () => {
    await agent
      .get('/api/story/' + context.game.uuid)
      .expect(200)
      .then((response) => {
        expect(response.body.stories[0]).toMatchObject({
          value:
            'Round 1 and Round 2 were round 3. He said, "Round 4." She said, "Round 5." So they round 6. '
        });
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
      .send({ type: 'story' });
    await agent1
      .post('/api/user')
      .send({ uuid: createResponse.body.uuid, nickname: 'storyTest1' });
    await agent2
      .post('/api/user')
      .send({ uuid: createResponse.body.uuid, nickname: 'storyTest2' });

    context.game = createResponse.body;
  });

  test('join phase', async () => {
    await agent1
      .get('/api/story')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.JOIN,
          isHost: true
        });
        expect(response.body.users).toEqual(
          expect.arrayContaining(['storyTest1', 'storyTest2'])
        );
      });

    await agent2
      .get('/api/story')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.JOIN,
          isHost: false
        });
        expect(response.body.users).toEqual(
          expect.arrayContaining(['storyTest1', 'storyTest2'])
        );
      });
  });

  test('play phase', async () => {
    await agent1.put(`/api/game/${context.game.uuid}`).send({ phase: 'play' });

    const response = await agent1.get('/api/story').expect(200);
    expect(response.body).toMatchObject({
      phase: GamePhase.PLAY
    });
  });

  test('submit entry - round 1, user 1', async () => {
    await agent1.put(`/api/story`).send({ part: 'r1 u1' }).expect(200);

    await agent1
      .get('/api/story')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: WAIT,
          round: 0
        });
      });

    await agent1.put(`/api/story`).send({ part: 'r1 u1' }).expect(400);

    await agent2
      .get('/api/story')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.PLAY,
          round: 0
        });
      });
  });

  test('submit entry - round 1, user 2', async () => {
    await agent2.put(`/api/story`).send({ part: 'r1 u2' }).expect(200);
    await agent2
      .get('/api/story')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.PLAY,
          round: 1
        });
      });

    await agent1
      .get('/api/story')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.PLAY,
          round: 1
        });
      });
  });

  test('submit entry - remaining rounds', async () => {
    for (let i = 2; i <= 6; i++) {
      await agent1
        .put(`/api/story`)
        .send({ part: `r${i} u1` })
        .expect(200);
      await agent2
        .put(`/api/story`)
        .send({ part: `r${i} u2` })
        .expect(200);
    }

    const response1 = await agent1.get('/api/story').expect(200);
    const response2 = await agent2.get('/api/story').expect(200);
    expect(response1.body.phase).toEqual(GamePhase.READ);
    expect(response2.body.phase).toEqual(GamePhase.READ);

    expect([response1.body.story, response2.body.story]).toEqual(
      expect.arrayContaining([
        'R1 u1 and R2 u2 were r3 u1. He said, "R4 u2." She said, "R5 u1." So they r6 u2. ',
        'R1 u2 and R2 u1 were r3 u2. He said, "R4 u1." She said, "R5 u2." So they r6 u1. '
      ])
    );
  });

  test('get archive', async () => {
    await agent1
      .get('/api/story/' + context.game.uuid)
      .expect(200)
      .then((response) => {
        expect(response.body.stories.map((s: any) => s.value)).toEqual(
          expect.arrayContaining([
            'R1 u1 and R2 u2 were r3 u1. He said, "R4 u2." She said, "R5 u1." So they r6 u2. ',
            'R1 u2 and R2 u1 were r3 u2. He said, "R4 u1." She said, "R5 u2." So they r6 u1. '
          ])
        );
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
      .send({ type: 'story' });
    await agent1
      .post('/api/user')
      .send({ uuid: createResponse.body.uuid, nickname: 'storyTest1' });
    await agent2
      .post('/api/user')
      .send({ uuid: createResponse.body.uuid, nickname: 'storyTest2' });

    context.game = createResponse.body;
  });

  test('join phase', async () => {
    await agent1
      .get('/api/story')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.JOIN,
          isHost: true
        });
        expect(response.body.users).toEqual(
          expect.arrayContaining(['storyTest1', 'storyTest2'])
        );
      });

    await agent2
      .get('/api/story')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.JOIN,
          isHost: false
        });
        expect(response.body.users).toEqual(
          expect.arrayContaining(['storyTest1', 'storyTest2'])
        );
      });
  });
  
  test('submit entry - round 1, user 1', async () => {
    await agent1.put(`/api/game/${context.game.uuid}`).send({ phase: 'play' });
    await agent1.put(`/api/story`).send({ part: 'r1 u1' }).expect(200);

    await agent1
      .get('/api/story')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: WAIT,
          round: 0
        });
      });

    await agent1.put(`/api/story`).send({ part: 'r1 u1' }).expect(400);

    await agent2
      .get('/api/story')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.PLAY,
          round: 0
        });
      });
  });

  test('user 2 leaves', async () => {
    await agent2.put(`/api/story`).send({ part: 'r1 u2' }).expect(200);
    await agent2.delete('/api.user');

    await agent1
      .get('/api/story')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          phase: GamePhase.PLAY,
          round: 1
        });
      });
  });
});
