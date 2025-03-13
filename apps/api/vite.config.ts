import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [swc.vite()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  ssr: {
    noExternal: ['supertest', 'express'],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    exclude: ['test/**/*.e2e-spec.ts'],
    deps: {
      inline: ['@nestjs/common', '@nestjs/core', '@nestjs/platform-express'],
    },
  },
});
