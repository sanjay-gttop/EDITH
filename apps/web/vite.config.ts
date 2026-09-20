import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  resolve: {
    alias: {
      '@resqsync/domain': path.resolve(__dirname, '../../packages/domain/src/index.ts'),
      '@resqsync/contracts': path.resolve(__dirname, '../../packages/contracts/src/index.ts'),
      '@resqsync/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@resqsync/offline': path.resolve(__dirname, '../../packages/offline/src/index.ts'),
      '@': path.resolve(__dirname, './src'),
    },
  },
});
