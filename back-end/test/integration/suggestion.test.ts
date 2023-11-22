/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeAll, describe, expect, test } from '@jest/globals';
import request, { agent as requestAgent } from 'supertest';

import app from '../../src/server';

const agent = requestAgent(app);

beforeAll(async () => {
  await agent
    .post('/api/admin')
    .send({ username: 'username', password: 'password' });
});

describe('getSuggestions', () => {
  test('unauthorized', async () => {
    await request(app).get('/api/suggestion').expect(403);
  });

  test('success', async () => {
    await agent.get('/api/suggestion').expect(200);
  });
});

describe('add and remove suggestion', () => {
  let uuid: string;
  test('add', async () => {
    const suggestionResponse = await agent
      .post('/api/suggestion')
      .send({ category: 'STATEMENT', value: 'Hello there' })
      .expect(201);
    uuid = suggestionResponse.body.uuid;

    expect(suggestionResponse.body.category).toEqual('STATEMENT');
    expect(suggestionResponse.body.value).toEqual('Hello there');
  });

  test('update 1', async () => {
    const suggestionResponse = await agent
      .patch('/api/suggestion/' + uuid)
      .send({ category: 'MALE_NAME', value: 'General Kenobi' })
      .expect(200);
    expect(suggestionResponse.body.category).toEqual('MALE_NAME');
    expect(suggestionResponse.body.value).toEqual('General Kenobi');
    expect(suggestionResponse.body.uuid).toEqual(uuid);
  });

  test('update 2', async () => {
    const suggestionResponse = await agent
      .patch('/api/suggestion/' + uuid)
      .send({ value: 'General Skywalker' })
      .expect(200);
    expect(suggestionResponse.body.category).toEqual('MALE_NAME');
    expect(suggestionResponse.body.value).toEqual('General Skywalker');
    expect(suggestionResponse.body.uuid).toEqual(uuid);
  });

  test('delete', async () => {
    await agent.delete('/api/suggestion/' + uuid).expect(200);
  });

  test('add - failure', async () => {
    await agent.post('/api/suggestion').expect(500);
    await agent
      .post('/api/suggestion')
      .send({ category: 'STATEMENTS', value: 'Hello there' })
      .expect(400);
  });
});
