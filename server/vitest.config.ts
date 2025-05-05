import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    // Set the root directory to the project root
    root: './',
    // Include only server tests
    include: ['server/**/*.test.ts'],
    // Explicitly exclude everything else
    exclude: ['**/node_modules/**', '**/dist/**', 'src/**'],
    // Use the server setup file if needed
    setupFiles: ['./server/setupTests.ts']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url))
    }
  }
})