import css from './view/DataTable.css?inline';

export { provideStylesheet, resolveTheme, themeStylesheet };
export type { ThemeStylesheet };

// The stylesheet of one theme: no custom properties of our own (2026-10-09, the user's wish: they inherit into
// everything inside the table, custom cell content too, and fill the dev tools). The source (`DataTable.css`)
// reads the theme as `var(--param-…)` placeholders; each is replaced by the theme's value here, once per theme (a
// `createDataTableComponent` or `setupDataTable` call). The rules are scoped to the roots of that theme
// (`data-data-table-theme`, `@scope`), so tables of different themes can share a page. The keyframes stay outside the
// scope (they read no theme value).
type ThemeStylesheet = {
  id: string;
  // The values by theme key, for the few lengths the view computes inline (see `useThemed` in config.ts).
  values: Readonly<Record<string, string>>;
  css: string;
};

const KEYFRAMES = /@keyframes [\w-]+\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g;
// Without its comments: they are for the source (and some name `--param-…`).
const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
const keyframes = (source.match(KEYFRAMES) ?? []).join('\n');
const rules = source.replace(KEYFRAMES, '');

let nextId = 1;

// `color-text-dimmed` → `colorTextDimmed`.
function keyOf(name: string): string {
  return name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

// Every `var(--param-…)` of the text replaced by the theme's value.
function resolveTheme(text: string, values: Readonly<Record<string, string>>): string {
  return text.replace(/var\(--param-([a-z-]+)\)/g, (_, name: string) => {
    const value = values[keyOf(name)];

    if (value === undefined) {
      throw new Error(`The theme has no value for "${keyOf(name)}".`);
    }

    return value;
  });
}

// The scope of a theme's rules (the prelude of its `@scope`): from the parent of its tables' roots, down to (not into) anything beside them that is
// not one of them. Not the root itself (`@scope ([data-data-table-theme])`, until 2026-10-09): no selector inside `@scope`
// can match the scope's root (only `:scope` can), so `.data-table { … }` and every rule on the root's state
// (`:where([data-density='compact']) …`) never applied: the root was a plain block without `max-height: 100%`, and a
// table did not fit the height its app gave it.
function scopeOf(id: string): string {
  const root = `[data-data-table-theme='${id}']`;

  return `(:has(> ${root})) to (:scope > :not(${root}))`;
}

function themeStylesheet(values: Readonly<Record<string, string>>): ThemeStylesheet {
  const id = String(nextId++);

  return {
    id,
    values,
    css: `${keyframes}\n@scope ${scopeOf(id)} {\n${resolveTheme(rules, values)}\n}\n`,
  };
}

// The documents and shadow roots that have the stylesheet of a theme already, by theme id.
const provided = new WeakMap<Node, Set<string>>();

// The stylesheet has to be where the table is: once per document, or once per shadow root when the table sits inside
// one (e.g. the custom element in the template of another component). First in it, so the app's own rules come later.
function provideStylesheet(element: Element, stylesheet: ThemeStylesheet): void {
  const root = element.getRootNode();
  const target = root instanceof ShadowRoot ? root : element.ownerDocument.head;
  const ids = provided.get(target) ?? new Set<string>();

  if (ids.has(stylesheet.id)) {
    return;
  }

  ids.add(stylesheet.id);
  provided.set(target, ids);

  const style = element.ownerDocument.createElement('style');

  style.textContent = stylesheet.css;
  target.prepend(style);
}
