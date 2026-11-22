import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
  test: {
    // Run in a node-like environment (no DOM needed for pure logic tests).
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
