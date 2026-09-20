import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/unit/**/*.{test,spec}.ts',
      'tests/integration/**/*.{test,spec}.ts',
      'tests/chaos/**/*.{test,spec}.ts',
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
      '@resqsync/api': path.resolve(__dirname, './services/api/src/index.ts'),
      '@resqsync/sync-worker': path.resolve(__dirname, './services/sync-worker/src/index.ts'),
      '@resqsync/ai-adapter': path.resolve(__dirname, './services/ai-adapter/src/index.ts'),
      '@resqsync/simulation-gateway': path.resolve(__dirname, './services/simulation-gateway/src/index.ts'),
      '@resqsync/channel-adapter': path.resolve(__dirname, './services/channel-adapter/src/index.ts'),
      '@resqsync/replay-control-plane': path.resolve(__dirname, './services/replay-control-plane/src/index.ts'),
    },
  },
});
