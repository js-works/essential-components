import react from '@vitejs/plugin-react';
import { defaultClientConditions, defineConfig } from 'vite';

import { appRoutes } from './vite.routes.js';

// The demo page of all packages. The demos come from the workspace packages, by relative imports
// (`../packages/file-upload/demo/…`); the apps import the packages by name (`@local/data-table/react`), resolved to
// their sources by the `source` condition of the packages' `exports` (no build of a package needed). All of them use
// one React: `dedupe` makes sure of it even where a package has a
// React of its own (e.g. a pinned version in its node_modules).
//
// `vite build --mode pages` builds for GitHub Pages (js-works.github.io/essential-components), which serves the site
// under a subpath.
//
// Only the latest Chrome, Edge, Firefox and Safari are supported. The CSS is built for `esnext`, so modern CSS stays as
// it is (else the minifier lowers `light-dark()` into variables that follow the page's color scheme, not the
// `color-scheme` of the element). The JavaScript for `es2024`: newer syntax that not every one of them has yet (`using`)
// is lowered.
const config = defineConfig(({ mode }) => ({
  plugins: [...appRoutes(), react()],
  base: mode === 'pages' ? '/essential-components/' : '/',
  resolve: {
    dedupe: ['react', 'react-dom'],
    conditions: ['source', ...defaultClientConditions],
  },
  build: {
    target: 'es2024',
    cssTarget: 'esnext',
  },
}));

export default config;
