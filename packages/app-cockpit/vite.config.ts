import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// `vite` serves the demo (index.html), `vite build` builds the library (src/index.ts). React and Base UI stay outside
// the build.
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: { index: 'src/index.ts' },
      formats: ['es'],
    },
    rolldownOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^@base-ui\/react($|\/)/],
    },
  },
});
