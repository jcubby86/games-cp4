import { describe, expect, test } from '@jest/globals';
import request from 'supertest';

import app from '../../src/server';

describe('admin', () => {
  test('createAdmin - failure', async () => {
    await request(app).put('/api/admin').expect(400);
  });

  test('createAdmin - success', async () => {
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'password';
    await request(app).put('/api/admin').expect(200);
  });

  test('login - bad request', async () => {
    await request(app).post('/api/admin').send({}).expect(401);
  });

  test('login - invalid user', async () => {
    await request(app)
      .post('/api/admin')
      .send({ username: 'user', password: 'pass' })
      .expect(401);
  });

  test('login - invalid password', async () => {
    await request(app)
      .post('/api/admin')
      .send({ username: 'admin', password: 'pass' })
      .expect(401);
  });

  test('login - success', async () => {
    const result = await request(app)
      .post('/api/admin')
      .send({ username: 'admin', password: 'password' })
      .expect(200);
    expect(result.headers['set-cookie']).not.toBeUndefined();
  });
});
