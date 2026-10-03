import { defineConfig } from 'vite';

// `vite` serves the demo (index.html), `vite build` builds the library (src/index.ts). Its dependencies (Lit, Zag.js,
// Floating UI) stay outside the build.
export default defineConfig({
  build: {
    lib: {
      entry: { index: 'src/index.ts' },
      formats: ['es'],
    },
    rolldownOptions: {
      external: [/^lit($|\/)/, /^@zag-js\//, /^@floating-ui\//],
    },
  },
});
