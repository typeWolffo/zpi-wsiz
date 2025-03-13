import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2ETest } from './create-e2e-test';
import { DatabasePg } from '../src/common';
import { JwtService } from '@nestjs/jwt';
import { createUserFactory } from './factory/user.factory';
import { USER_ROLES } from '../src/user/schemas/userRoles';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

describe('Vehicle Controller (e2e)', () => {
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

    // Tworzymy testowego użytkownika z rolą ADMIN
    const user = await userFactory
      .withRole(USER_ROLES.ADMIN)
      .withCredentials({ password: 'password123' })
      .create();

    // Generujemy token uwierzytelniający z właściwą strukturą pól
    authToken = jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }, 60000);

  afterAll(async () => {
    if (app) await app.close();
  });

  it('GET /api/vehicle/all bez autentykacji powinno zwrócić 401', async () => {
    await request(app.getHttpServer()).get('/api/vehicle/all').expect(401);
  });

  it('GET /api/vehicle/:id bez autentykacji powinno zwrócić 401', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    await request(app.getHttpServer())
      .get(`/api/vehicle/${nonExistentId}`)
      .expect(401);
  });

  it('POST /api/vehicle bez autentykacji powinno zwrócić 401', async () => {
    const newVehicle = {
      customerId: uuidv4(),
      make: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 2000, max: 2023 }).toString(),
      registrationNumber: faker.vehicle.vrm(),
      vin: faker.vehicle.vin(),
    };

    await request(app.getHttpServer())
      .post('/api/vehicle')
      .send(newVehicle)
      .expect(401);
  });

  it('GET /api/vehicle/all z uwierzytelnieniem powinno zwrócić listę pojazdów', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/vehicle/all')
      .set('Cookie', [`access_token=${authToken}`])
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('GET /api/vehicle/:id z nieistniejącym ID powinno zwrócić 400 Bad Request', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    await request(app.getHttpServer())
      .get(`/api/vehicle/${nonExistentId}`)
      .set('Cookie', [`access_token=${authToken}`])
      .expect(400);
  });
});
