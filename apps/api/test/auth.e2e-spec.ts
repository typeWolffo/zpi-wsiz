import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2ETest } from './create-e2e-test';
import { DatabasePg } from '../src/common';

describe('Auth Controller (e2e)', () => {
  let app: INestApplication;
  let db: DatabasePg;

  beforeAll(async () => {
    const test = await createE2ETest();
    app = test.app;
    db = test.db;
  }, 60000);

  afterAll(async () => {
    if (app) await app.close();
  });

  it('GET /api/auth/current-user bez tokenu powinno zwrócić 401', async () => {
    await request(app.getHttpServer())
      .get('/api/auth/current-user')
      .expect(401);
  });

  it('POST /api/auth/login z nieprawidłowymi danymi powinno zwrócić 401', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      })
      .expect(401);
  });
});
