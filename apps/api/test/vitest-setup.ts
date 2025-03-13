import { beforeAll, afterAll, vi } from 'vitest';
import { applyFormats } from 'nestjs-typebox';

import { setupValidation } from 'src/utils/setup-validation';

const originalLog = console.log;

const filteredLog = (...args: any[]) => {
  if (
    args.some(
      (arg) =>
        typeof arg === 'object' &&
        arg !== null &&
        (arg.severity_local === 'NOTICE' || arg.severity === 'NOTICE'),
    )
  ) {
    return;
  }

  originalLog(...args);
};

beforeAll(async () => {
  applyFormats();
  setupValidation();
  vi.spyOn(console, 'log').mockImplementation(filteredLog);
});

afterAll(() => {
  vi.restoreAllMocks();
});
