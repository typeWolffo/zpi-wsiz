import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import { createUnitTest, TestContext } from '../../test/create-unit-test';

class ExampleService {
  getSomeData() {
    return { value: 'test-data' };
  }
}

describe('ExampleService', () => {
  let testContext: TestContext;
  let exampleService: ExampleService;

  beforeAll(async () => {
    testContext = await createUnitTest([
      {
        provide: ExampleService,
        useClass: ExampleService,
      },
    ]);

    exampleService = testContext.module.get<ExampleService>(ExampleService);
  });

  afterAll(async () => {
    await testContext.teardown();
  });

  it('powinien zwrócić poprawne dane', () => {
    const result = exampleService.getSomeData();
    expect(result).toEqual({ value: 'test-data' });
  });
});
