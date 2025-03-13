import { beforeAll, afterAll } from 'vitest';
import { applyFormats } from 'nestjs-typebox';

import { setupValidation } from 'src/utils/setup-validation';
import { sharedTestDb } from './shared-test-db';

beforeAll(async () => {
  // Inicjalizacja formatu i walidacji
  applyFormats();
  setupValidation();

  // Tworzenie współdzielonej bazy danych testowej
  await sharedTestDb.init();
}, 60000);

afterAll(async () => {
  // Zamknięcie współdzielonej bazy danych testowej
  await sharedTestDb.close();
});
