import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts', 'src/mocks/**/*.spec.ts'],
    env: {
      VITE_API_URL: 'https://api.example.com/api',
      VITE_TENANT_ID: 'wl',
    },
  },
})
