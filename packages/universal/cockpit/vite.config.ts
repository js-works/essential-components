import { defineConfig } from 'vitest/config';

// `vite` serves the demo (index.html), `vite build` builds the library: the main entry (src/main/index.ts) and the React
// wrappers (src/main/react/index.ts, the subpath `@local/cockpit/react`). Lit and React stay outside the build.
export default defineConfig({
  build: {
    // Only the latest Chrome, Edge, Firefox and Safari: modern CSS (e.g. `light-dark()`) stays as it is.
    target: 'es2024',
    cssTarget: 'esnext',
    lib: {
      entry: { index: 'src/main/index.ts', react: 'src/main/react/index.ts' },
      formats: ['es'],
    },
    rolldownOptions: {
      external: [/^lit($|\/)/, /^react($|\/)/, /^react-dom($|\/)/],
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/test/**/*.test.{ts,tsx}'],
  },
});
