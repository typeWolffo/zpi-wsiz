import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2ETest } from './create-e2e-test';
import { DatabasePg } from '../src/common';
import { JwtService } from '@nestjs/jwt';
import { createUserFactory } from './factory/user.factory';
import { USER_ROLES } from '../src/user/schemas/userRoles';

describe('Mechanic Controller (e2e)', () => {
  let app: INestApplication;
  let db: DatabasePg;
  let jwtService: JwtService;
  let userFactory: ReturnType<typeof createUserFactory>;
  let authToken: string;

  beforeAll(async () => {
    const test = await createE2ETest();
    app = test.app;
    db = test.db;
    jwtService = app.get(JwtService);
    userFactory = createUserFactory(db);

    const user = await userFactory
      .withRole(USER_ROLES.ADMIN)
      .withCredentials({ password: 'password123' })
      .create();

    authToken = jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }, 60000);

  afterAll(async () => {
    if (app) await app.close();
  });

  it('GET /api/mechanic/all bez autentykacji powinno zwrócić 401', async () => {
    await request(app.getHttpServer()).get('/api/mechanic/all').expect(401);
  });

  it('GET /api/mechanic/:id bez autentykacji powinno zwrócić 401', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    await request(app.getHttpServer())
      .get(`/api/mechanic/${nonExistentId}`)
      .expect(401);
  });

  it('GET /api/mechanic/all z uwierzytelnieniem powinno zwrócić listę mechaników', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/mechanic/all')
      .set('Cookie', [`access_token=${authToken}`])
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('GET /api/mechanic/:id z nieistniejącym ID powinno zwrócić 400 Bad Request', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    await request(app.getHttpServer())
      .get(`/api/mechanic/${nonExistentId}`)
      .set('Cookie', [`access_token=${authToken}`])
      .expect(400);
  });
});
