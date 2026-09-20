import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/unit/**/*.{test,spec}.ts',
      'packages/*/src/**/*.{test,spec}.ts',
      'services/*/src/**/*.{test,spec}.ts',
    ],
  },
  resolve: {
    alias: {
      '@resqsync/domain': path.resolve(__dirname, './packages/domain/src/index.ts'),
      '@resqsync/contracts': path.resolve(__dirname, './packages/contracts/src/index.ts'),
      '@resqsync/ui': path.resolve(__dirname, './packages/ui/src/index.ts'),
      '@resqsync/offline': path.resolve(__dirname, './packages/offline/src/index.ts'),
    },
  },
});
