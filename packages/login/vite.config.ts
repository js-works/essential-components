import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// `vite` serves the demo (index.html), `vite build` builds the library (src/index.ts, and its CSS). React and Mantine
// stay outside the build (peer dependencies).
export default defineConfig({
  plugins: [react()],
  build: {
    // Only the latest Chrome, Edge, Firefox and Safari: modern CSS (e.g. `light-dark()`) stays as it is.
    target: 'esnext',
    lib: {
      entry: { index: 'src/index.ts' },
      formats: ['es'],
    },
    rolldownOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^@mantine\//],
    },
  },
});
