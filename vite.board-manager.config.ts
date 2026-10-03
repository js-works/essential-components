import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

// `npm run build:board-manager`: the `<board-manager>` custom element (demo/board-manager/app/BoardManagerElement.tsx) as
// one ES module with everything it needs (React, Mantine, the packages), into `dist-board-manager/`. Its CSS is not a
// file of its own: `inlineStyles()` puts it into the module, which adds it to the element's shadow root. So nothing of
// it reaches the host page. `index.html` next to it is an example page.

const MARKER = '__BOARD_MANAGER_STYLES__';

const EXAMPLE_PAGE = `<!doctype html>
<html lang="en-US">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Board Manager</title>
    <!-- An AMD loader, like on an XWiki page: the element must work beside it (see \`banner\`). -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js"></script>
    <script type="module" src="./board-manager.js"></script>
    <!-- The colors, the font and the text size are custom properties of the element (without them, Mantine's). -->
    <style>
      board-manager {
        --board-manager-accent-color: #0ca678;
        --board-manager-font-family: Georgia, serif;
        --board-manager-font-size: 15px;
      }
    </style>
  </head>
  <body style="margin: 0; padding: 16px">
    <board-manager hash="board-manager"></board-manager>
  </body>
</html>
`;

// Replaces the marker string in the bundle with all CSS of the build, and drops the CSS files.
function inlineStyles(): Plugin {
  return {
    name: 'board-manager-inline-styles',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const styles = Object.values(bundle).filter((file) => file.type === 'asset' && file.fileName.endsWith('.css'));
      const css = styles
        .map((file) => {
          const source = file.type === 'asset' ? file.source : '';

          return typeof source === 'string' ? source : new TextDecoder().decode(source);
        })
        .join('\n');
      let replaced = false;

      for (const file of styles) {
        delete bundle[file.fileName];
      }

      for (const file of Object.values(bundle)) {
        if (file.type === 'chunk' && file.code.includes(MARKER)) {
          file.code = file.code.replace(new RegExp(`(["'\`])${MARKER}\\1`, 'g'), () => JSON.stringify(css));
          replaced = true;
        }
      }

      if (!replaced) {
        this.error(`The marker ${MARKER} is not in the bundle: the element would have no styles.`);
      }

      this.emitFile({ type: 'asset', fileName: 'index.html', source: EXAMPLE_PAGE });
    },
  };
}

const config = defineConfig({
  plugins: [react(), inlineStyles()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  define: {
    // A library build does not replace it on its own, and React picks its development build by it.
    'process.env.NODE_ENV': JSON.stringify('production'),
    // The host page may have Prototype.js (XWiki: 1.7.3), which replaces `Object.values` with one that also returns
    // what it added to `Array.prototype` (e.g. react-pdf's text layout failed, `e.reduce is not a function`). The
    // bundle uses its own (see `banner`); the page's one stays as it is.
    'Object.values': '__boardManagerObjectValues',
  },
  build: {
    // Only the latest Chrome, Edge, Firefox and Safari: modern CSS (e.g. `light-dark()`) stays as it is.
    target: 'esnext',
    outDir: 'dist-board-manager',
    emptyOutDir: true,
    cssCodeSplit: false,
    // A library build of the ES format keeps its whitespace (for the pure annotations of a library that is bundled
    // again): this one is the end product, so it is minified completely.
    minify: true,
    rolldownOptions: {
      output: {
        // One file: the dynamic imports of the packages are part of it.
        inlineDynamicImports: true,
        minify: true,
        // The host page may have an AMD loader (XWiki: RequireJS): UMD modules in the bundle (e.g. the hyphenation
        // patterns of react-pdf) would register with it instead of exporting. A module-scoped `define` hides the
        // page's one; the page's own stays as it is. And the bundle's `Object.values` (see `define`), from
        // `Object.keys` (Prototype.js keeps the browser's one).
        banner: 'var define; var __boardManagerObjectValues = (o) => Object.keys(o).map((k) => o[k]);',
      },
    },
    lib: {
      entry: 'demo/board-manager/app/BoardManagerElement.tsx',
      formats: ['es'],
      fileName: () => 'board-manager.js',
    },
  },
});

export default config;
