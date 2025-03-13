import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [swc.vite()],
  test: {
    globals: true,
    root: '.',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    exclude: ['test/**/*.e2e-spec.ts'],
    setupFiles: ['test/vitest-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'test/', 'dist/'],
    },
    deps: {
      inline: [
        '@nestjs/common',
        '@nestjs/core',
        '@nestjs/platform-express',
        '@nestjs/testing',
      ],
    },
  },
  resolve: {
    alias: {
      src: resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['cookie-parser'],
  },
});
