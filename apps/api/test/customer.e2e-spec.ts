import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2ETest } from './create-e2e-test';
import { DatabasePg } from '../src/common';
import { JwtService } from '@nestjs/jwt';
import { createUserFactory } from './factory/user.factory';
import { USER_ROLES } from '../src/user/schemas/userRoles';

describe('Customer Controller (e2e)', () => {
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

  it('GET /api/customer/all bez autentykacji powinno zwrócić 401', async () => {
    await request(app.getHttpServer()).get('/api/customer/all').expect(401);
  });

  it('GET /api/customer/:id bez autentykacji powinno zwrócić 401', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    await request(app.getHttpServer())
      .get(`/api/customer/${nonExistentId}`)
      .expect(401);
  });
});
