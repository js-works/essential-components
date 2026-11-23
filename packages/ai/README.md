# ai

Project-independent instructions for AI agents: plain Markdown, for any AI tool.

## Layout

- `instructions/common/`: for every project.
  - `general.md`: language, the `src/` trees, file names, docs, dependencies, generated files.
  - `typescript.md`: types, exports, imports, constants, "not set" values.
- `instructions/frontend/`: for frontend code.
  - `general.md`: browsers and builds, one name per component.
  - `css.md`: custom properties, themes, BEM, CSS rules.
  - `i18n.md`: texts, with or without an i18n library.
  - `react.md`: components, props, peer dependencies.
  - `mantine.md`: apps built on Mantine.
  - `custom-elements.md`: tags, names and property values of custom elements.
- `instructions/backend/`: for backend code (none yet).

## Rules for these files

- No imports of any kind: each file stands on its own.
- No names of a specific repository or project; examples are neutral.
- One topic per file, so a project picks only what fits.
- English.

## Usage

- Claude Code: import the fitting files in the project's `CLAUDE.md`, by a path relative to it:
  ```md
  @../../ai/instructions/common/general.md
  @../../ai/instructions/frontend/css.md
  ```
- Tools without imports: list the paths in their instruction file (e.g. `AGENTS.md`) and tell the agent to read them.
- A project's own rules stay in its own instruction file, on top of these.

## Copying

`packages/ai` is always copied along with any package that refers to it, so the paths keep working.
