import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// `vite` serves the demo (index.html), `vite build` builds the library (src/index.ts) and its stylesheet
// (src/styles.css, with BlockNote's). React, Mantine and BlockNote stay outside the build (the app's).
export default defineConfig({
  plugins: [react()],
  build: {
    // Only the latest Chrome, Edge, Firefox and Safari: modern CSS stays as it is.
    target: 'es2024',
    cssTarget: 'esnext',
    // The stylesheet is an entry of its own (`dist/styles.css`, `@local/rich-text/styles.css`), as Mantine's packages
    // have theirs: the app imports it.
    cssCodeSplit: true,
    lib: {
      entry: { index: 'src/index.ts', styles: 'src/styles.css' },
      formats: ['es'],
    },
    rolldownOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^@mantine\//, /^@blocknote\//],
    },
  },
  test: {
    environment: 'jsdom',
  },
});
