# Custom element conventions

- Tags:
  - The host registers the element under a tag of its choice; the package suggests its own name. A one-word package
    (no hyphen, so no valid tag) suggests a tag of two words with it, e.g. `@scope/cockpit` and `<app-cockpit>`.
  - A package never registers a tag itself; an internal element of its own is registered as `internal-<name>-<n>`,
    `n` the first number not registered yet (e.g. `internal-cockpit-taskbar-1`).
- Type names:
  - The element's type is the package's name and `Element` (`FileUploadElement`, `CockpitElement`,
    `DataTableElement`), never a global name like `Element`.
  - The class an element factory returns is the package's name and `Class` (`DataTableClass`, `FileUploadClass`), its
    config named after the factory (`FileUploadClassConfig`).
- "Not set" (a missing value): a property returns the value with its meaning; `null` only where no value exists. An
  element's properties follow the DOM:
  - `string`: `''` (`name`, `label`).
  - `boolean`: `false`, the attribute missing (`disabled`).
  - A set of values: its default (`density`: `'normal'`).
  - `number` with a meaning for "not set" (a limit, a count, a size): plain `number`, that value as the default: no
    minimum `0`, no maximum `Infinity`, else the default (`maxParallel`: `3`). `Infinity` removes the attribute (it
    cannot be written); a missing or invalid attribute is the default.
  - `number` without one (a field's value, a chosen index): `number | null`.
  - An object or a function: `null` for none (`upload: UploadFunction | null`, like `onclick` and `form`).
  - Never a magic number (`-1`, `NaN`) for "not set".
  - An invalid value: the setter throws a `RangeError` (a negative limit), like `input.maxLength = -3`.
  - Weighed: `undefined` (TypeScript's own guideline, but an element's API is the DOM's); `-1` like `input.maxLength`
    (a value to translate).
