import { describe, expect, test } from '@jest/globals';
import request from 'supertest';

import app from '../../src/server';

describe('health', () => {
  test('should get OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
  });
});
