import { Test, type TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';

import { AppModule } from '../src/app.module';
import { sharedTestDb } from './shared-test-db';

import type { Provider } from '@nestjs/common';

export async function createE2ETest(customProviders: Provider[] = []) {
  // Upewniamy się, że baza danych jest zainicjalizowana
  if (!sharedTestDb.isInitialized) {
    await sharedTestDb.init();
  }

  // Korzystamy ze współdzielonej bazy danych
  process.env.DATABASE_URL = sharedTestDb.connectionString;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
    providers: [...customProviders],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  await app.init();

  return {
    app,
    moduleFixture,
    db: sharedTestDb.db,
  };
}
