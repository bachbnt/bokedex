import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url))

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '#shared': path('./shared'),
      '#ingest': path('./scripts/ingest'),
      '#server': path('./server'),
      '~': path('./app'),
    },
  },
})
