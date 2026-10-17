import react from '@vitejs/plugin-react';
import { defaultClientConditions } from 'vite';
import { defineConfig } from 'vitest/config';

// `vite` serves the demo (index.html), `vite build` builds the library (src/index.ts) and its stylesheet
// (src/styles.css). React, Mantine, TanStack Router and i18next stay outside the build (the app's).
export default defineConfig({
  plugins: [react()],
  // The repository's packages (`@local/data-table`) by their sources (the `source` condition of their `exports`).
  resolve: { conditions: ['source', ...defaultClientConditions] },
  build: {
    // Only the latest Chrome, Edge, Firefox and Safari: modern CSS stays as it is.
    target: 'es2024',
    cssTarget: 'esnext',
    // The stylesheet is an entry of its own (`dist/styles.css`, `@local/micro-app/styles.css`), as Mantine's packages
    // have theirs: the app imports it.
    cssCodeSplit: true,
    lib: {
      entry: { index: 'src/index.ts', styles: 'src/styles.css' },
      formats: ['es'],
    },
    rolldownOptions: {
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^@mantine\//,
        /^@tanstack\//,
        /^i18next/,
        /^react-i18next/,
        /^@local\//,
      ],
    },
  },
  test: {
    environment: 'jsdom',
  },
});
