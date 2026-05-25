import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['components/**/*.spec.ts'],
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: ['./vitest.setup.ts'],
  },
})
