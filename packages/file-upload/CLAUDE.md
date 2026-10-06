# file-upload

A file upload custom element, without any framework.
The main goal is a very nice, yet simple, API, designed together with the user.

## Working rules

- Design first: discuss the API step by step.
  - Do NOT implement anything until the user gives an explicit GO.
- Keep answers short: not longer than necessary to understand them. No long recaps or lists of what was done.
  One topic per step.
- When offering alternatives, number them, add small code examples, and always state which one is proposed and
  how confident that proposal is (e.g. a percentage).
- Prefer bullet lists over prose, in answers and in this file, wherever reasonable.
- English is the language of the project: code, comments, docs, specs and rules. Never German there.
  - Exception: translated texts, like the German texts of the demo's language switch.
  - The conversation may be German.
- VERY IMPORTANT: never introduce a new CSS custom property (`--…`) without the user's explicit permission.
  - Ask first, with the name and why none of the existing ones does.
  - The need should be rare: use the existing ones (`--ui-*`, the package's own), plain values, or a local calc.
  - A new one, once allowed, carries the package's prefix (never a generic name like `--shadow` or `--border`: the
    mini-apps are light DOM children and inherit them, and they collide with other libraries).
- Never run `git commit` or `git push`.
  - The user does this personally.
  - This overrides any default attribution or commit guidance.
- Never read, list or scan anything outside this project folder.
  - This includes sibling projects, parent folders, the repo root and the home directory (e.g. `~/.claude`).
  - Only the user may explicitly grant an exception for a specific path.
- `src/api.ts` holds the draft API types we are discussing. Types only, no comments for now (comments come later).
  - Each API decision changes only this file.
  - The types are plain flat type exports (no `declare namespace`). `src/index.ts` re-exports them as a namespace:
    `export type * as FileUpload from './api'`, so users write `FileUpload.Theme`, `FileUpload.FileItem`, ...
    - Do not use runtime (value) namespaces.
- Do not update `README.md` until the first release.
- Do not mention any specific i18n library by name in code, docs or specs, except react-i18next as the example.
- Always add behavior details we decide (also small ones) to this spec, in the same step as the code.
- Add coding guidelines to this file whenever they result from our discussion, and tell the user.

## Stack (decided)

- TypeScript (strict), Vite (library mode), npm. No framework: a vanilla Custom Element.
- No runtime dependencies. The only peer dependency is React, and it is optional (`peerDependencies` +
  `peerDependenciesMeta: { react: { optional: true } }`, `>=19` for `ref` as a prop): only the subpath
  `@local/file-upload/react` imports it. React is never passed in via the config.
- Tests: Vitest with jsdom and `@testing-library/dom`, in three Vitest projects (`vite.config.ts`):
  - `jsdom`: `*.test.ts(x)`, with `vitest.setup.ts`. The React wrapper with `@testing-library/react`.
  - `browser`: `*.browser.test.ts(x)`, the Vitest browser mode (real Chromium, `@vitest/browser-playwright`), for form
    association, because jsdom lacks it. The browsers are installed by hand (install scripts are off):
    `npx playwright install chromium`.
  - `server`: `*.server.test.ts(x)`, plain Node without a DOM: server rendering of the React wrapper (`renderToString`).
- npm never runs install scripts of dependencies: `.npmrc` has `ignore-scripts=true`. (Our own `npm run` scripts are
  not affected.)
- npm only installs versions that are at least 7 days old: `.npmrc` has `min-release-age=7`. It applies when npm
  resolves versions (a new install or an update), not to what is already in `package-lock.json`.
- `.editorconfig`: 2 spaces, LF, UTF-8, max line length 120
- Formatter: dprint (`dprint.json`), line width 120. Not Prettier.
  - Manual line breaks in method chains are preserved, so break chains by hand where it reads better.
  - Single quotes in TS.

## Project layout and commands

- `src/api.ts`: the spec (types only, flat exports): `Element`, `ElementClass`, `Config`, `Theme`, `Upload`,
  `FileItem`, ...
- `src/core/`: plain TypeScript, no DOM rendering.
  - `store.ts`: `FileUploadStore`, all state and behavior (validation, list, queue, abort), with `subscribe` and
    `getItems`. It calls its listeners only when the list really changes.
  - `accept.ts` (the `accept` matcher), `texts.ts` (the English default texts, `createLocalizer`: texts via the
    `I18nAdapter` and sizes formatted in its locale), `view.ts` (hints, status text,
    actions per status), `preview.ts` (object URL for image previews), `utils.ts`.
- `src/element/`: the custom element.
  - `createFileUploadClass.ts`: the factory (the public entry).
  - `FileUploadElement.ts`: the internal base class (attributes, properties, shadow DOM, rendering of the list,
    tooltip, preview dialog, focus).
  - `styles.ts`: the CSS (a template string with the theme values put in) and the shared stylesheet.
  - `icons.ts`: the SVG icons (Tabler, with the license notice, including Tabler's `upload` for the drop area).
  - `FileUploadElement.test.ts`: the tests of the element. `FileUploadElement.browser.test.ts`: form association.
- `src/index.ts`: the public API (`createFileUploadClass` and the types as the namespace `FileUpload`).
- `src/react/`: the React wrapper, the subpath `@local/file-upload/react` (built as `dist/react.js`, the main entry as `dist/index.js`).
  - `api.ts`: its types (`Config`, `Props`), like `src/api.ts`. `index.ts` exports `createFileUploadComponent` and the
    types as the namespace `FileUploadComponent`.
  - `createFileUploadComponent.tsx`: the factory. `client.ts`: the DOM part (the element class, the internal adapter
    setter), loaded with `import()` on the first mount, so the wrapper can be imported on the server.
  - Tests: `createFileUploadComponent.test.tsx` (jsdom), `createFileUploadComponent.server.test.tsx` (Node).
- `demo/` + `index.html`: the demo (`npm run dev`).
  - `index.html` + `main.ts`: the page, a shell around the demo element: a header with the title and, top right, the
    global switches (language, color scheme), which change `<html>`. It registers the demo element as `file-upload-demo`.
  - `FileUploadDemo.ts`: the whole demo as a light DOM custom element (see "Demo element" below), with two tabs:
    "Custom element" and "React". The custom element tab, plain HTML and TypeScript: the switches of the component
    (the behavior of the fake server, accept, max. file size, max. files, parallel uploads, multiple, manual upload,
    previews, density, required, disabled), below them two elements side by side (default look with a `<label for>` of the
    page, and `acme-upload` with its own theme, styles, a `::part()` rule, a `prompt` slot and its own label), each in
    a `<form>` (`name="attachments"`) with a line with the state of its list and a submit that shows what the form
    sends. The fake server (`upload.ts`) answers with an id. `format.ts`: the state line and the sent values.
  - `react/ReactDemo.tsx`: the React tab (`mountReactDemo(container)`, returns the unmount). Two columns, each with its
    own language (a React context read by the `hook` of `i18n`, adapter `createLocaleI18n`), a `required` switch and a
    `<form>` whose submit shows the `FormData`. The second one has a JSX label and fills the `prompt` slot.
  - `demo.css`: only what is specific to this demo.
- `demo/ui/`: `ui.css` and `ui.ts`, a small general-purpose design language (BEM classes and tokens with the prefix
  `ui-`, tabs), copied between projects. Its purpose, usage and the rules for changing it are documented in the header
  of `ui.css`: read them before changing it.
- `vitest.setup.ts`: jsdom polyfills (popover, `URL.createObjectURL`, no-op `setFormValue`/`setValidity`) and cleanup.
- Commands:
  - `npm run dev`: the demo
  - `npm run build`: typecheck + library build
  - `npm run typecheck`
  - `npm test`: Vitest (once, all three projects). `npm run test:watch`: watch mode
  - `npm run format`: dprint. `npm run format:check`
  - `npm run loc`: lines of code per part (tests, api, core, element, react, demo, library, all).
    `npm run loc:files`: per file. The grouping lives in `scripts/loc.ts`.
- `scripts/`: Node scripts, run by Node directly (type stripping, so only erasable TS syntax). They have their own
  `tsconfig.scripts.json` with the Node types, so Node globals do not leak into the browser code. `npm run typecheck`
  checks both configs. Types for untyped packages go into `scripts/modules.d.ts`.
- Run `npm run format` and `npm run typecheck` after changes.

## Code rules

- Class members are either public or `#private` (ECMAScript private fields).
  - Never use the TypeScript `private` or `protected` keywords.
- `undefined` means "not set" (optional properties, attributes that are missing). `null` means "explicitly no value" for
  an argument that is always passed (like Web IDL's nullable types), e.g. `params` of `I18nAdapter.resolveText`.
- No `any`.
  - Use `unknown` and narrow it.
  - No `@ts-ignore`. `@ts-expect-error` only with a reason comment.
- Use `readonly` wherever useful and reasonable.
  - Arrays in public types: `readonly T[]`, never mutable `T[]` (input we don't own must not be mutated).
  - Class fields that are never reassigned: `readonly`.
  - Constant lookup data: `as const`.
  - Not needed for props object properties or local variables (`const` is enough there).
- Named exports only, never `export default`.
  - Per file, exports are declared in exactly two places, directly after the import statements at the top:
    - at most one `export { ... }` for implementations
    - at most one `export type { ... }` for types
  - Never put `export` on the declarations themselves.
  - The public API is exactly what `src/index.ts` re-exports. Everything else is internal.
- Every public API change comes with a Vitest test and a usage example (demo). No feature without both.
- Ask before adding a dependency.
  - Keep runtime dependencies minimal (none so far).

## CSS guidelines

- The CSS lives in `src/element/styles.ts` as a template string, with the theme values put in when a class is created.
- No CSS custom properties as API without a concrete need. Prefer values put into the CSS directly (e.g. from the
  `theme` config), `::part()` and plain CSS.
- Never rely on the tag name: `:host`, not the tag.
- Sizes, spacings and font sizes in `em`, never `rem` (`em` scales with the theme's `fontSize`, `rem` does not).
  - `em` is relative to the element's own font size: on a small text (6/7 of the base) the values are larger to get
    the same spacing. Icons are sized in `em` too (their `width`/`height` attributes are only a fallback).
  - Not for borders and outlines (`px`) and not for theme values.
- Native CSS nesting, no preprocessors. No inline styles, no `!important`, never remove focus outlines.
- State with attributes: `data-*` (`data-dragging`, `data-status`, `data-tooltip-anchor`), `inert`, `hidden`.
  - Our rules set `display`, so `.root [hidden]` (last, and more specific than the `.x` rules) restores
    `display: none`.
- Responsive rules are container queries on the element's own width (`@container file-upload (…)`), never media
  queries on the screen width. They come directly after the default rules they change.
- Colors only from the theme (defaults in `DEFAULT_THEME`), with `light-dark()` for both color schemes. Dark mode
  follows the `color-scheme` of the page.
- Native controls (`button`, `progress`), styled by us. Our own tooltip instead of `title`.

## Design decisions (decided)

- The component does not talk to a server itself. The app gives it an upload function (like `source` in
  `react-datanav`), so there are no URLs, headers or chunk settings in the API.
  - `upload(file, { signal, onProgress })` is called once per file and returns a promise. The component only tracks the
    state of each file.
    - The promise may resolve with a string (e.g. a server id): the form value of the file (see form association).
  - `signal` is an `AbortSignal`: the component aborts it when the user cancels a file, and when the element is
    removed from the page.
  - `onProgress` takes a fraction from 0 to 1.
  - Chunking, retries, resuming and headers are the business of the app's function (e.g. inside a helper).
- The component becomes a vanilla Custom Element (no Lit, no other framework). The demo becomes vanilla too. A React
  wrapper comes much later.
  - Shadow DOM (open). Styling from outside with `::part()` (plus the `theme` and `styles` config, see below), and
    `<slot>`s where the app can put its own content.
  - Slots (each with default content, replaced only when the app fills it): `icon` (the icon of the drop area),
    `prompt` (the text of the drop area, before the "Browse" button), `limits` (the hints in the drop area), `label`
    (our own label, default: the `label` attribute) and `error` (the error text, default: the `error` attribute). The rows of the list are not slots.
  - Configuration: simple values are attributes (kebab-case, e.g. `max-files`) reflected to properties (camelCase,
    e.g. `maxFiles`). Functions (`upload`) are properties only.
  - We never register the element. The app gets its class from the factory `createFileUploadClass(config?)` and
    registers it itself, with its own tag name, in the global or a scoped registry.
    - The config is per class, not per instance (e.g. the styles are built once and shared with `adoptedStyleSheets`).
      Without a config, the defaults apply (English texts, default styles). The config contains `theme` and `styles`
      (see below). Texts come later (see TODO).
    - Usual usage: a one-line subclass, so the app's class is a value and a type at once:
      `class AcmeUpload extends createFileUploadClass({ ... }) {}`, then
      `customElements.define('acme-upload', AcmeUpload)`.
    - No base class is exported as a value. A type for the instance (`FileUpload.Element`) is exported only for
      generic code that works with any variant (e.g. the later React wrapper).
    - The code never relies on the tag name (use `:host`, not the tag, in CSS).
  - Styling config (per class):
    - `theme` (type `FileUpload.Theme`): typed values (colors, radius, fonts) that are put straight into our CSS when
      the class is created. No public CSS custom properties, so no token names and no prefix. Every color
      (`accentColor` too) takes a string or `{ light, dark }` (turned into `light-dark()`). Values may be `var(...)`:
      the variables of the app's design system are inherited into the shadow DOM.
    - `styles`: extra CSS, added after our default CSS in the shadow root.
    - A different look for one area of the page: `::part()` or a second class.
    - Theme values, named like the CSS properties they feed (`…Color`, `borderRadius`, `fontFamily`, `fontSize`):
      - Colors: `accentColor`, `accentTextColor` (marks on the accent or a status color, e.g. in the preview badges),
        `textColor` (default: inherited from the page), `mutedColor`, `borderColor` (the text buttons: a darker mix of
        it with `mutedColor`), `surfaceColor` (hover, thumbnail and progress track), `successColor`, `dangerColor`.
      - `borderRadius` (default `4px`; thumbnails, the tooltip and the preview dialog use half of it: `2px`, the
        `--ui-radius-sm` of the design language of the demos, see the root `CLAUDE.md`).
      - `buttonBorderRadius` (default `5px`, the `--ui-radius-md` of the design language): all buttons (text and
        icon buttons), except the preview (a thumbnail) and the close button of the preview dialog (in its corner).
      - `fontFamily` (default: inherited from the page) and `fontSize`: the base size (default `0.875rem`). All sizes
        and spacings inside are relative to it (`em`), so it scales the whole element. Names and the prompt use it,
        the small texts 6/7 of it. Names have the normal weight (400), the status text a medium one (500).
    - Parts: `label`, `error`, `root`, `drop-area`, `browse-button`, `limits`, `upload-all-button`, `clear-button`, `list`, `row` (plus
      `row-<status>`, e.g. `row-error`), `thumbnail`, `name`, `size`, `progress`, `status`, `actions`, `action-button`, `tooltip`.
  - Properties set before the element is defined (e.g. by a framework) are taken over when it is upgraded.
  - Tests: Vitest + jsdom with `@testing-library/dom`, queries inside the shadow DOM via `within(el.shadowRoot)`. Small
    polyfills in `vitest.setup.ts` where jsdom lacks something (e.g. popover). Switch to the Vitest browser mode only if
    jsdom gets in the way too often.
  - Demo: plain HTML and TypeScript (no framework, except the React tab). The feature switches are native selects (also
    `off`/`on` for booleans), they set attributes and properties on the elements. The page is styled by the design
    language in `demo/ui/`, not by the component. Below each element, its state line (listens to `change`, reads
    `items`). The language switch (English, German) sets `<html lang>`; both classes get the demo's `I18nAdapter`
    (`demo/i18n.ts`: German texts, locale from `<html lang>`, watched with a `MutationObserver`).
  - Demo element (decided): the demo is a light DOM custom element without attributes, so a "meta demo" can combine the
    demos of several components (e.g. with vertical tabs on the left). Rules, for this demo and the demos of other
    components:
    - A class extending `HTMLElement`, exported and never registered: the page registers it under a tag name of its
      choice (here `index.html`/`main.ts` as `file-upload-demo`).
    - Light DOM, no shadow root: the design language and the page reach into it.
    - Global switches (language, color scheme: they change `<html>`) belong to the page, not to the demo. A demo only has
      the switches of its own component.
    - No fixed ids: the tabs get theirs from `ui.ts`, other ids are generated per instance (the demo may be on a page
      twice). Page hooks are `data-*` attributes or classes inside the demo, queried within the element.
    - Connect: `setupUi(this)` and mounting (e.g. React); disconnect: their cleanups. The markup is rendered once.
    - The components under test are registered once (a guard), with fixed tag names.
    - Its CSS (`demo.css`) is global (light DOM), so every rule is specific to the demo's own content (its components,
      their parts), never a change of the design language.
    - Nested tabs: the URL hash has one segment per level (`#file-upload/react`), see `ui.ts`.
    - The meta demo is the sibling project `../combined-demo`: it imports the demo element by a relative path
      (`../../<project>/demo/<Name>Demo`), so the file name and the export must stay stable.
  - Package name: `@local/file-upload` (private, never published: copied into customer monorepos; replaces
    `file-upload-element`, before that `react-file-upload`). The React wrapper is the subpath
    `@local/file-upload/react` of the same package.
  - React wrapper: `createFileUploadComponent(config)` returns a React component. Its types are the namespace
    `FileUploadComponent` (`FileUploadComponent.Config`, `FileUploadComponent.Props`) of the subpath.
    - The call has no side effect and needs no DOM (it also works on the server).
    - The first mount on the client loads the element code (`import()`), creates the class and registers it, under the next free generated tag name
      (`internal-file-upload-<n>`), or under the optional `tagName` of the config (a stable name for tests, DevTools,
      CSS).
    - The element is rendered only on the client (after mount), the server renders a placeholder of the same height.
      So the generated tag name never causes a hydration mismatch. A failed registration (e.g. a taken `tagName`) is
      thrown during rendering, so an error boundary gets it.
      - The placeholder: an empty `div` with the same `className`, `style` and `id`, `aria-busy="true"`, and the
        `min-height` of the empty element (the drop line only, computed from the theme's `fontSize` and the `density` prop).
    - Localization: `i18n` is a discriminated union on `type` (only inside `i18n`, so the top level of the config stays
      flat). Without `i18n`: the English defaults. Another `type` makes `createFileUploadComponent` throw a `TypeError`
      (for plain JavaScript and cast configs).
      - `i18n: { type: 'factory', getAdapter }` (for i18n libraries that read the DOM, e.g. `lang`): passed on to the
        element class unchanged. A factory may return a shared adapter or a new one per element.
      - `i18n: { type: 'hook', useAdapter: () => I18nAdapter }` (for i18n libraries with a React context): the
        component calls it on every render, so each instance follows the nearest provider, with nothing extra at the
        place of use. The `use` prefix keeps the hooks lint rules working.
      - The wrapper sets that adapter on its element through a hidden, internal per-instance mechanism (not public
        API): it replaces the adapter of the class config, and the element subscribes to its `onChange` instead.
    - The props (decided): one camelCase prop per element property (`upload`, `accept`, `maxFiles`, `maxFileSize`,
      `maxParallel`, `multiple`, `manualUpload`, `previews`, `disabled`, `name`, `required`), plus `lang`,
      `onChange(items)` (gets `items` directly; the native event stays reachable via the ref) and `ref` to the element
      (`FileUpload.Element`, a plain prop as in React 19). Uncontrolled.
      - The wrapper sets the properties itself (not through React's handling of custom elements), and only those that
        changed, because every change renders the list of the element again. A prop that goes away sets the property
        back to its default (`maxParallel`: the attribute is removed).
    - The slots are `ReactNode` props (`label`, `prompt`, `icon`, `limits`), rendered into the element with `slot="…"`. Not set:
      the default content.
    - Other attributes that pass through to the element (typed explicitly): `className`, `style`, `id`, `aria-*`,
      `data-*`.
  - Types: flat type exports in `src/api.ts`, re-exported from the main entry as the namespace `FileUpload`
    (`import { createFileUploadClass, type FileUpload } from '@local/file-upload'`). No `declare namespace`, no
    `/types` subpath. The instance type is `FileUpload.Element`. A namespace import cannot merge with the later React
    component, so the wrapper's types are decided then.
  - Boolean attributes switch something on, so every boolean defaults to `false` (HTML convention). Positive names, no
    verbs (like `<video controls>`):
    - `multiple`: several files (default: one file, like the native file input).
    - `manual-upload` (`manualUpload`): files wait as `ready` (default: upload right away). Replaces `autoUpload`.
    - `previews`: thumbnails of images (default: off).
    - `disabled`.
  - `density` (decided): `'compact' | 'normal' | 'comfortable'` (type `FileUpload.Density`), an
    attribute reflected to the property, and the React prop `density`. Default `normal`, like the data navigator.
    - Only the vertical padding changes (the rows of the list and the drop line). Text and controls keep their size
      (the theme's `fontSize` scales those).
    - `compact` is the look so far. `normal` and `comfortable` add room.
    - The vertical padding (`DENSITY_PADDING` in `styles.ts`): rows 0.286em, 0.571em, 1.143em (the data navigator's
      4px, 8px, 16px at 14px), the drop line 0.571em, 0.857em, 1.429em.
    - A missing or unknown value is `normal`. The element puts the value on `root` as `data-density`. A change only
      sets that attribute: the list is not rendered again, and there is no `change` event.
    - The React placeholder takes the height of the empty element in its density (a browser test checks both).
  - A plain `change` event (like `<input>`, bubbling): it only says that the list changed (see `change` below). The app
    reads the list from the read-only property `items` (`readonly FileItem[]`, not `files`, to avoid confusion with
    `input.files`). The `change` event of the inner `<input>` stays inside the shadow DOM.
  - Localization: an `I18nAdapter` per element, from `i18n: { type: 'factory', getAdapter: (element) => I18nAdapter }`
    in the class config (`createFileUploadClass({ i18n: { type: 'factory', getAdapter } })`). Nested and with a `type`,
    so that the React config can add `{ type: 'hook', useAdapter }` as a discriminated union inside `i18n`. The element calls it once, on its first connect, with itself (so an
    adapter can read e.g. the element's `lang`). It may return one shared adapter or a new one per element. No i18n
    library as a dependency; an adapter for any i18n library must stay a few lines.
    ```ts
    type I18nAdapter = {
      currentLocale: () => string;
      resolveText: (
        namespace: string,
        key: string,
        params: Readonly<Record<string, unknown>> | null,
        defaultValue: string,
      ) => string;
      onChange?: (listener: () => void) => () => void;
    };
    ```
    - Reusable by other components without sharing the type (structural typing): only `string`, `unknown`, `Record`,
      `null` and functions, nothing component-specific. A component types only the members it needs; a fuller adapter
      (e.g. with `hasText`) is a subtype and fits. Never change it incompatibly, only add optional members.
    - `namespace` is `'fileupload'`. `key` is a `FileUpload.TextKey`; `FileUpload.TextParams` maps each key to its
      params (`null` for texts without params). Params hold raw numbers (`count`, `percent`) and already formatted
      strings (`size`, `types`).
    - `defaultValue` is the English text, already filled in (numbers formatted in the current locale). For a missing
      text the adapter returns it.
    - `currentLocale()` is read once per render, for `Intl` (sizes, numbers). An invalid tag falls back to `en-US`.
    - `onChange`: the element subscribes while connected (and unsubscribes when disconnected). A notification
      refreshes every text, accessible name and formatted size; list, uploads and focus stay. On connect the texts are
      refreshed too.
    - Without an adapter: the English texts, formatted in `en-US`.
  - Icons: the SVGs of the Tabler icons, copied into `icons.ts` (with the MIT license notice), no icon dependency. The
    drop area shows Tabler's `upload` (a tray with an arrow up), with a thinner stroke (1.5).
  - Controls: native `<button>` and `<progress>`, styled by us. Icon buttons keep their `aria-label` and get our own
    small tooltip: a `popover="manual"` element with `role="tooltip"`, shown on hover and on keyboard focus, placed with
    CSS anchor positioning. Where anchor positioning is missing, the tooltip is not shown (the buttons keep their
    `aria-label`). No `title`.

## Requirements (drafted by Claude, not discussed yet)

These are the first proposals behind `src/api.ts` and the element. Each one can be changed.

- Adding files:
  - A "Browse" button (which opens the file dialog) and drag and drop. The whole element is the drop target (also the
    list). While files are dragged over it, `data-dragging` is set on `root` and the whole element is highlighted.
  - One layout (`fontSize` scales it): a table with one line per file (thumbnail, name, size, progress bar, status,
    actions; the columns of all rows line up via subgrid), and below it one line (the drop area) with a small arrow, the
    prompt, "Browse", the hints (right) and "Upload all". Empty, only that line is shown, about as high as an input.
    - Narrow (the element itself narrower than 60em, a container query): two lines per file. The first one with the
      thumbnail, the name, the size and the buttons, the second one with the progress bar (filling the line) and the
      status. The columns still line up. The breakpoint is fixed: `styles` can only add rules for a wider one (the
      container is named `file-upload`), not switch ours off.
    - Because of the container query, the element takes its width from outside (as a block it fills its parent; as a
      flex or grid item it needs a width or has to grow).
    - Height: as high as its content, unless the element has a height limit (e.g. `max-height`, or a height as a flex
      item). Then the list scrolls (`overflow: auto`) and the line below it (drop area, "Clear", "Upload all") stays
      visible: the element is a flex column (label, frame), the frame's list row is `minmax(0, auto)`.
  - `multiple` (default `false`). Without it, the file input takes one file, and a newly added file replaces the current
    one: its upload is aborted and it disappears from the list.
  - The same file can be chosen again (the input is reset after each choice).
  - Folders, paste and a separate camera input are not part of it for now.
- Validation, per file, when it is added. The first failing check wins:
  1. `accept`: like the `accept` attribute of a file input: a comma-separated list of extensions (`.pdf`), MIME types
     (`application/pdf`) and wildcards (`image/*`). Extensions are compared without regard to case. Empty or missing
     accepts everything. The same string is given to the file input.
  2. `maxFileSize` in bytes.
  3. `maxFiles`: the number of files in the list that are not rejected. A rejected file does not count, and removing a
     file gives its place back.
  - A rejected file is not dropped silently: it is shown in the list with its reason (`Rejection`: `type`, `size`,
    `count`), it is never uploaded, and it can only be removed.
  - The limits are shown as hints in the drop area (only those that are set).
  - There is no minimum size.
- The list: every added file is a row with a preview or a status icon, the name (with an ellipsis), the size, a status
  text and the actions. "Upload all" is shown next to the drop area when needed.
  - Status icon (decorative, the status text says the same): a spinner while `uploading` (it stands still with
    `prefers-reduced-motion`), a checkmark in `successColor` when `done`, a warning sign in `dangerColor` on `error` and
    `rejected`, else a file icon.
  - `FileItem`: `id` (stable per added file), `file`, `status`, `progress` (0 to 1), and `rejection` or `error` when
    they apply.
  - Status: `ready` (added, waits for the user, only with `manualUpload`), `queued` (waits for a free slot),
    `uploading`, `done`, `error`, `aborted` (canceled by the user) and `rejected`.
  - Actions per status (icon buttons with a tooltip and an `aria-label`; upload is a play triangle, stop a square, retry
    two round arrows, cancel and remove the same X):
    - `ready`: upload, remove. `queued`: cancel. `uploading`: stop. `error`, `aborted`: retry, remove. `done`,
      `rejected`: remove.
    - Stop does the same as cancel (the file becomes `aborted`); it only has its own icon and label for a running
      upload.
    - The buttons are right-aligned, so remove (always the last one) lines up in every row.
    - Retry starts the upload again with a new signal and progress 0.
  - Text buttons ("Browse", "Clear", "Upload all", decided): all in the same neutral style (border, no fill, the
    `surfaceColor` on hover), none in the accent color. Their text has the size of the prompt next to them (`1em`;
    it was `0.857em` until 2026-09-29, too small). The empty element's height follows (the React placeholder:
    content 1.806em, see `createFileUploadComponent.tsx`). They look as harmless as possible, because they will rarely
    match the buttons of the app's component library exactly, and the element is a form field, not the page's main
    action. "Upload all" keeps its icon and its place at the end. An app that wants a prominent button styles it with
    `::part()`.
  - "Clear" (decided): a text button in the drop line, next to "Upload all" (before it). Shown while the list has at least one file. It does the same as a
    form reset: running uploads are aborted, the list is emptied, `change` is fired. No confirmation. The focus then
    moves to "Browse". Text `clear` ("Clear"), part `clear-button`.
  - Only an uploading file shows a progress bar (a native `progress` named after the file) and the percent in the status
    text.
- Uploading:
  - By default, files are queued when they are added. With `manualUpload` they are `ready`, each row has an upload
    button, and an "Upload all" button appears while at least one file is `ready`.
  - `maxParallel` (default 3): at most so many uploads run at a time. The others are `queued` ("Waiting") and start as
    soon as a place is free, in the order of the list.
  - A rejected promise sets `error` (the reason is in `FileItem.error`). A function that throws synchronously counts the
    same. Nothing is logged: the app knows its errors.
  - Canceling, removing and replacing abort the signal and mark the file as outdated: everything the upload reports
    afterwards (progress, resolve, reject) is ignored, also the `AbortError` it typically rejects with.
  - Removing the element from the page aborts all running uploads and marks the running and waiting files as
    `aborted`. Moving it (removed and added again in the same task) keeps them running.
  - Without an upload function (`upload` not set yet) the files wait as `queued` and start as soon as it is set.
  - `onProgress` values are clamped to 0 to 1.
- `change` event: fired whenever anything in the list changes (also progress), and not on connect or when only an option
  changes. The app reads `items`, e.g. to enable a "Save" button once every file is `done`.
  - There is no settable file list for now.
- `previews` (default `false`): a thumbnail of image files (an object URL, released when the row goes away or the
  element is removed from the page). Other files show the status icon.
  - On a preview, `uploading`, `done`, `error` and `rejected` show as a small badge in its bottom right corner:
    - `uploading`: a dot in `accentColor` with a ring that grows and fades (it stands still with
      `prefers-reduced-motion`).
    - The others: a circle in `successColor` or `dangerColor` with a checkmark or warning mark in `accentTextColor`.
    - Decorative, like the status icon.
  - A preview is a button ("Show preview", with the tooltip) that opens the image large in a modal `<dialog>` (at most
    90% of the screen, `aria-label` is the file name) with a close button (the X, "Close preview", flush in the top
    corner of the dialog, without a gap). It closes with Escape, the close button and a click next to the image; the focus goes back to the thumbnail. It
    also closes when the preview goes away (row removed, `previews` off, element removed from the page) and on
    `disabled`. No part for now.
    - Opening and closing are animated (0.3s): the dialog fades in and grows from 95%, the backdrop fades in, and back
      when it closes. Opening is CSS only (`@starting-style`). Closing by the user (Escape, the close button, a click
      next to the image) sets `data-closing`, which plays the transition backwards, and closes the dialog when its
      animations have finished; this works in every browser. Closes the user did not ask for are instant. No
      animation with `prefers-reduced-motion`.
- `disabled`: the whole component is `inert`, and dropped files are ignored.
- Texts (English defaults in `texts.ts`, translations via the `I18nAdapter`): every visible text and every accessible
  name. Sizes are formatted with `Intl` (unit style, `1 kB = 1024 bytes`) in the adapter's locale. There is no plural
  handling in the defaults: they are worded so that they do not need it (an adapter gets `count` and can pluralize).
- Accessibility: the list is a `ul` with an accessible name, the progress bar has one, and everything works with the
  keyboard (the "Browse" button is the way to add files without a mouse).
  - Label (decided): as flexible as reasonable, both ways work.
    - Labelable from outside, like an input: `<label for>`, a wrapping `<label>`, `aria-label`, `aria-labelledby`. The
      element is a group (`ElementInternals.role`), which the label names. A click on a `<label>` of the element
      focuses "Browse" (not the file dialog). Read-only `labels`, like `<input>`.
    - Its own label, optional: the `label` attribute (reflected to `label`) or the `label` slot, shown above the
      element (part `label`) only when set. Its text names the group (the slot's content is watched). A click on it
      focuses "Browse". For apps without their own fields; apps with a design system label the element themselves.
    - The React wrapper's `label` prop is a `ReactNode`, rendered into the `label` slot.
    - Error (decided 2026-10-06, the user's wish; display only): the `error` attribute (reflected to `error`) or the
      `error` slot, shown below the frame (part `error`, `role="alert"`, the danger color; the frame gets the danger color
      too, `data-invalid` on `root`) and `aria-invalid` on the element. It does not make the element invalid (like
      Mantine's `error`): the app owns that text (from Zod, the server). The React wrapper's `error` prop is a
      `ReactNode`, rendered into the slot.
    - The element's own validity is shown the same way, in place of the browser's bubble: on the `invalid` event (a form
      submit, `reportValidity()`) it cancels the event (no native bubble) and shows its `validationMessage` as the
      error, until it is valid again. The app's `error` wins over it. The focus is not moved (the text is always
      visible), like any control whose app handles `invalid` itself.
    - Description: not now. Later with the same pattern (attribute, slot, part), without breaking anything.
  - Tooltips show on hover after 500ms (leaving before shows none) and at once on keyboard focus (`:focus-visible`,
    so not after a click or when the focus comes back from the preview dialog), and hide on blur, on leaving and on
    Escape.
  - When the buttons of a focused row change (e.g. "Cancel" becomes "Retry" and "Remove"), the focus moves to the
    first new button. When a focused row is removed, the focus moves to the row that took its place, else the one
    before, else "Browse".
- Not in the first version: chunking, folder upload, paste, removing a file on the server, preloaded files, a controlled
  file list, image resizing, other UI libraries.

## Open

- A large layout (a big drop area above the list), later and only on request: `layout: 'compact' | 'large'` (default
  `'compact'`, so adding it is not breaking). `layout` is the structure; the spacing is `density` (decided, see above).
- Everything above under "Requirements" is a proposal.

## TODO

- Decide the contract for `styles` (the extra CSS in the shadow root): which selectors an app may rely on. Proposal so
  far: only the parts (`[part~='…']`), the documented state attributes (`data-status` on rows, `data-dragging` and
  `inert` on `root`) and `:host(…)` with our attributes are stable; class names and DOM structure stay internal. Then
  also change the demo's `styles` to use a part.
- Form association (`ElementInternals`, decided): the element becomes a form control.
  - Value (decided): for each `done` file, the string its upload resolved with (e.g. a server id), one `FormData` entry
    per file under the element's `name`. A file that resolves without a value adds nothing. The value always mirrors
    the current list: a removed file is no longer in it (it stays on the server; the server treats uploads as temporary
    and keeps only the ids that arrive with the form).
  - Validity (decided): the element is invalid (the form cannot be submitted) when
    - a file is `error` or `aborted` (the user retries or removes it),
    - a file is `ready`, `queued` or `uploading` (its value is not known yet),
    - `required` (new boolean attribute, default `false`) is set and no file is `done`.
    - Flags: `badInput` for failed and unfinished files, `valueMissing` for `required` (`customError` stays for
      `setCustomValidity`, whose message wins). `reportValidity()` shows the message in the error area (part `error`, see Label), not in a browser bubble.
    - Rejected files do not make it invalid. One message (a new text), the first failing check in this order wins:
      `validationFailed` ("Retry or remove the files that failed."), `validationPending` ("Wait until all uploads are
      finished."), `validationRequired` ("Please add a file.").
  - Reset (decided): `form.reset()` aborts all running uploads and removes every file (like an emptied file input),
    and fires `change`.
  - Fieldset (decided): like native inputs. The element is disabled when `disabled` is set or an ancestor `<fieldset>`
    is disabled (`formDisabledCallback`), with the same behavior as `disabled`. The `disabled` property reflects only
    our own attribute. A disabled element is neither submitted nor validated.
  - Members (decided): the native set, with the names of `<input>`: `name` and `required` (attributes reflected to
    properties), read-only `form`, `validity`, `validationMessage`, `willValidate`, and `checkValidity()`,
    `reportValidity()`, `setCustomValidity()`. `name` is `undefined` when missing (our rule, not `''` like `<input>`);
    without a name, nothing is submitted.
  - Result (decided): `FileItem.result?: string`, set when the file is `done` and its upload resolved with a string.
    Retry clears it.
- Possible SSR improvements for the React wrapper (later, not breaking): render the empty state on the server as
  declarative shadow DOM (`<template shadowrootmode="open">`) instead of the placeholder. Needs a string renderer of
  the empty state (kept identical to the DOM one), a fixed `tagName`, texts on the server (the `hook` only), the
  element adopting the existing shadow root, and a way around React's hydration mismatch for the `<template>`.
