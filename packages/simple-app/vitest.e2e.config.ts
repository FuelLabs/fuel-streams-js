import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/e2e/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    globals: true,
    environment: 'node',
    setupFiles: ['tests/e2e/setup.ts'],
    sequence: {
      hooks: 'list',
    },
  },
});