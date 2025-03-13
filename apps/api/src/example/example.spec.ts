import { describe, it, expect, vi } from 'vitest';

describe('Przykładowy test Vitest', () => {
  it('1 + 1 powinno być równe 2', () => {
    expect(1 + 1).toBe(2);
  });

  it('powinien działać z asynchronicznymi funkcjami', async () => {
    const asyncResult = await Promise.resolve(42);
    expect(asyncResult).toBe(42);
  });

  it('powinien obsługiwać mocki', () => {
    const mockFn = vi.fn().mockReturnValue('mocked value');
    expect(mockFn()).toBe('mocked value');
    expect(mockFn).toHaveBeenCalled();
  });
});
