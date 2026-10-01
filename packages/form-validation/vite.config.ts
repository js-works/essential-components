import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// `vite build` builds the library (src/index.ts). React and Zod stay outside the build (peer dependencies).
const config = defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: { index: 'src/index.ts' },
      formats: ['es'],
    },
    rolldownOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^zod($|\/)/],
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

export default config;
