import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
    exclude: ['node_modules', 'e2e', '.next', '.opencode', '.tmp', 'playwright-report', 'test-results'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
})
