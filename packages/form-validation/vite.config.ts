import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// `vite build` builds the library (src/index.ts). React and Zod stay outside the build (peer dependencies).
const config = defineConfig({
  plugins: [react()],
  build: {
    // Only the latest Chrome, Edge, Firefox and Safari: modern CSS (e.g. `light-dark()`) stays as it is.
    target: 'esnext',
    lib: {
      entry: { index: 'src/index.ts' },
      formats: ['es'],
    },
    rolldownOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^zod($|\/)/],
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.d.ts', 'src/**/index.ts'],
      reporter: ['text', 'html'],
    },
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

export default config;
