import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2ETest } from './create-e2e-test';
import { DatabasePg } from '../src/common';
import { JwtService } from '@nestjs/jwt';
import { createUserFactory } from './factory/user.factory';
import { USER_ROLES } from '../src/user/schemas/userRoles';

describe('User Controller (e2e)', () => {
  let app: INestApplication;
  let db: DatabasePg;
  let jwtService: JwtService;
  let userFactory: ReturnType<typeof createUserFactory>;
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    const test = await createE2ETest();
    app = test.app;
    db = test.db;
    jwtService = app.get(JwtService);
    userFactory = createUserFactory(db);

    // Tworzymy testowego użytkownika z rolą ADMIN
    const user = await userFactory
      .withRole(USER_ROLES.ADMIN)
      .withCredentials({ password: 'password123' })
      .create();

    // Generujemy token uwierzytelniający
    authToken = jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }, 60000);

  afterAll(async () => {
    if (app) await app.close();
  });

  it('GET /api/user/all bez autentykacji powinno zwrócić 401', async () => {
    await request(app.getHttpServer()).get('/api/user/all').expect(401);
  });

  it('GET /api/user/:id bez autentykacji powinno zwrócić 401', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    await request(app.getHttpServer())
      .get(`/api/user/${nonExistentId}`)
      .expect(401);
  });

  it('GET /api/user/:id z nieistniejącym ID powinno zwrócić 400 Bad Request', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    await request(app.getHttpServer())
      .get(`/api/user/${nonExistentId}`)
      .set('Cookie', [`access_token=${authToken}`])
      .expect(400);
  });
});
