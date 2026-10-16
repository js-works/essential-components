import { defineConfig } from 'vite';

// `vite` serves the demo (index.html), `vite build` builds the library (src/index.ts). Its dependencies (Lit, Floating
// UI) stay outside the build.
export default defineConfig({
  build: {
    // Only the latest Chrome, Edge, Firefox and Safari: modern CSS (e.g. `light-dark()`) stays as it is.
    target: 'es2024',
    cssTarget: 'esnext',
    lib: {
      entry: { index: 'src/index.ts' },
      formats: ['es'],
    },
    rolldownOptions: {
      external: [/^lit($|\/)/, /^@floating-ui\//],
    },
  },
});
