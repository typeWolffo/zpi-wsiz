import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [swc.vite()],
  test: {
    globals: true,
    root: '.',
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
    setupFiles: ['test/vitest-e2e-setup.ts'],
    deps: {
      inline: [
        '@nestjs/common',
        '@nestjs/core',
        '@nestjs/platform-express',
        '@nestjs/testing',
        'express',
        'cookie-parser',
      ],
    },
    fileParallelism: false,
    isolate: false,
  },
  resolve: {
    alias: {
      src: resolve(__dirname, '../src'),
    },
  },
  ssr: {
    noExternal: ['supertest', 'express', '@nestjs/*', 'cookie-parser'],
  },
  optimizeDeps: {
    include: [
      'express',
      'supertest',
      'cookie-parser',
      'postgres',
      'testcontainers',
    ],
  },
});
