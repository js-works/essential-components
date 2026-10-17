# rich-text

`@local/rich-text`: a rich-text editor for Mantine apps (React), built on BlockNote. Created 2026-10-17 (the user's
wish: it will be used whenever an app needs a rich-text editor; the Board Manager's minutes editor was its start). The
rules of the root's `CLAUDE.md` apply.

## Conventions

The general rules (copies of the repository's master, `docs/conventions/`):

@docs/conventions/general.md
@docs/conventions/css.md
@docs/conventions/typescript.md
@docs/conventions/react.md

## Working rules

- `src/api/props.ts` holds the API types (`RichTextEditorProps`, `RichTextProps`, `RichTextFormat`,
  `RichTextMentions`, `MentionOption`); `src/index.ts` exports them flat and the two components.
- Always add the decisions (also small ones) to this file, in the same step as the code.

## Decided (2026-10-17, step by step with the user)

- Tier 2 (built on Mantine, and i18next where texts are needed; see the planned tiers of the conventions in the root's
  `CLAUDE.md`), with BlockNote's UX (a block editor: the `/` menu, drag handles), not Mantine's own `@mantine/tiptap`
  (a classic toolbar editor: another user experience).
- The name: `@local/rich-text`, `RichTextEditor` (the field) and `RichText` (the read-only view, the user's choice:
  the short form of `RichTextEditor readOnly`, for tables and detail views). Weighed: `rich-text-editor`,
  `mantine-block-note` (names the technology).
- Dependencies: `@blocknote/core`, `@blocknote/react`, `@blocknote/mantine` (`^0.55.0`, as the root has them); peers
  `react`, `react-dom` (`>=19`), `@mantine/core`, `@mantine/hooks` (`^9.5.1`; 9.5.1 pinned in the dev dependencies,
  like `login`).
- The value: a string, `format: 'blocknote' | 'html' | 'markdown'` on both components (default `'blocknote'`:
  BlockNote's block JSON, lossless; `html` and `markdown` portable, but lossy, through BlockNote's converters, which a
  headless editor per schema runs, `converterOf` in `schema.tsx`). `''` is the empty value. Plain text in the
  `blocknote` format (data from before an editor) is read as one paragraph per line. ProseMirror's JSON was weighed:
  BlockNote's own schema, through semi-internal APIs, so no more general.
- Mentions: one generic kind, given by the app: `mentions={{ suggest(query), labelOf(id), hrefOf?(id), onOpen?(id) }}`;
  `@` opens the list of `suggest`. Stored as `{ type: 'mention', props: { id } }`, shown as `@` and the current label
  (`labelOf`, also the app's text for a missing one: no text of the package's own), a link in the read-only view where
  `hrefOf` gives one; `onOpen` takes the click (the app's router, e.g. `navigate`; a click with a modifier key stays the
  browser's). In HTML a `<span data-mention-id>` with the label. In Mantine's accent color (`rich-text__mention`).
- The language: `<html lang>`, observed (like the data table and the overlays); BlockNote's own texts from its locale
  files (all of them: `de` for `de-DE`, `zhTW` for `zh-TW`, else English). The editor takes its texts when it is
  created, so it is created again when the language changes, with the value it has then (nothing typed is lost). No
  i18next needed so far.
- The props like Mantine's inputs (`Textarea`), on `Input.Wrapper` and `Input` (`component="div"`, `multiline`): the
  wrapper's (`label`, `description`, `error`, `required`, `withAsterisk`, `inputWrapperOrder`, `className`, `style`,
  `classNames`, `styles`), `size`, `radius`, `variant`, `disabled`, `readOnly`, `placeholder` (BlockNote's own
  otherwise), `autosize` (default `true`: the height grows from `minRows`, default 4, to `maxRows`, then the text
  scrolls; `false`: always `minRows` high), `value`, `defaultValue`, `onChange(value)`, `onBlur`; ours: `format`,
  `mentions`, `uploadFile`. A new `value` from outside (not the one the editor gave) replaces the document.
- The look, like Mantine's own packages: the editor inside a Mantine `Input` (its border, error, `size`, `radius`,
  `variant`, `disabled`; the focus border by `:focus-within`, the editor being a content-editable inside), the menus
  and toolbars of `@blocknote/mantine`, the text (font, size of the input's `size`, colors) from Mantine's variables
  through BlockNote's theme (`MANTINE_LOOK`, `look.tsx`; the scheme from Mantine's computed one), and a stylesheet the
  app imports, `@local/rich-text/styles.css` (`src/styles.css`: BlockNote's styles in a layer of their own, only its
  own, not its copy of Mantine's, which in a later layer won over Mantine's states; then ours, BEM `rich-text__…`).
- The blocks of the `/` menu: the text blocks (paragraph, headings, quote, bullet, numbered, check and toggle lists,
  code block, table, divider); the media blocks (image, video, audio, file) only with `uploadFile(file) =>
  Promise<url>` (BlockNote's option; without one they could only embed a URL); no emoji (neither the `:` picker nor the
  `/` menu's item). The emoji data stays in an app's bundle unless its build replaces `emoji-mart` and
  `@emoji-mart/data` (the Board Manager's `vite.board-manager.config.ts` does, about 0.5 MB).
- `RichText` shows nothing for an empty value (the app shows its own empty text); it always has the media blocks in
  its schema (it only shows).

## Later

- A `language` prop to override `<html lang>` (a part of the page in another language).
- Conversion functions outside React (e.g. `richTextToHtml(value)` for a PDF or an email).
- The size: all of BlockNote's locales are in an app's bundle (about 0.2 MB in the `<board-manager>` element, which
  had only German and English). A way to choose the languages (e.g. a `languages` option, or loading a locale when it
  is needed, where the app's build allows chunks).
- A `blocks` prop to offer fewer blocks (e.g. only paragraphs and lists for a short note).
- Reading mentions back from HTML (`data-mention-id`): today an HTML or Markdown value loses them as mentions.
- Check the look in the browser (only the tests ran): the Mantine colors through BlockNote's theme, the focus border,
  the sizes, the dark scheme.

## Layout and commands

- `exports` in `package.json`: `.` (`src/index.ts`, `dist/index.js`) and `./styles.css` (`src/styles.css`,
  `dist/styles.css`), each with a `source` condition first (the root's demo resolves the sources).
- `src/rich-text-editor.tsx`, `src/rich-text.tsx`, `src/schema.tsx` (the schemas with the mention, the converters),
  `src/format.ts` (the value and the blocks), `src/language.ts` (`<html lang>`, BlockNote's dictionaries), `src/look.tsx`
  (`MANTINE_LOOK`, the scheme), `src/styles.css`.
- Tests (Vitest, jsdom): `src/format.test.ts` (the formats), `src/components.test.tsx` (both components in a
  `MantineProvider`: the wrapper's texts, the value, mentions, the link, read-only).
- `demo/`: `rich-text-demo.tsx` (the demo as a light DOM custom element, exported, not registered; see "Demo element"
  in the `CLAUDE.md` of the file upload), `demo.tsx` (the editor with made-up people to mention, a switch of the
  format, the read-only view and the value), `main.ts` + `index.html` (the standalone page, `rich-text-demo`),
  `demo.css`, `ui/` (the design language, a copy).
- `npm run dev`, `npm run build` (library mode, `cssCodeSplit` for the stylesheet entry; React, Mantine and BlockNote
  outside), `npm run typecheck`, `npm test`, `npm run format`.
