import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import { createE2ETest } from './create-e2e-test';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { createUserFactory } from './factory/user.factory';
import { USER_ROLES } from '../src/user/schemas/userRoles';
import { DatabasePg } from '../src/common';

describe('AppController (e2e)', () => {
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

    // Tworzymy testowego użytkownika z rolą EMPLOYEE
    const user = await userFactory
      .withRole(USER_ROLES.EMPLOYEE)
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

  it('/ (GET) powinno zwrócić 404, ponieważ wszystkie endpointy używają prefiksu /api', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });

  it('/api (GET) powinno zwrócić 404, ponieważ nie jest to poprawny endpoint', () => {
    return request(app.getHttpServer()).get('/api').expect(404);
  });
});
