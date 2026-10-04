import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: './',
  server: { port: 5173, strictPort: true },
  build: { chunkSizeWarningLimit: 2000 },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
})
