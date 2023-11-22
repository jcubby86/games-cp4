/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeAll, describe, test } from '@jest/globals';
import request, { agent as requestAgent } from 'supertest';

import app from '../../src/server';

const agent = requestAgent(app);

beforeAll(async () => {
  await agent
    .post('/api/admin')
    .send({ username: 'admin', password: 'password' });
});

describe('getSuggestions', () => {
  test('unauthorized', async () => {
    await request(app).get('/api/suggestion').expect(403);
  })

  test('success', async () => {
    await agent.get('/api/suggestion').expect(200);
  })
});
