# Frontend conventions

- Browsers: only the latest Chrome, Edge, Firefox and Safari. Every Vite config builds with `build.target: 'es2024'`
  and `build.cssTarget: 'esnext'`: the CSS stays as it is (else the minifier lowers modern CSS like `light-dark()`
  wrongly), the JavaScript lowers newer syntax that not every one of them has yet (`using`: an unknown syntax breaks
  the whole module).
- One name per component package, in every form:
  - the folder and package: `data-table`, `@scope/data-table`
  - the component and element: `DataTable`, `<data-table>`
  - the BEM block: `data-table`, `data-table__cell`
  - the i18n namespace: `'dataTable'`
