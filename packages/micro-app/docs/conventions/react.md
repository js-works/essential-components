# React conventions

- Function components and hooks only. No class components.
- No return type on a component (2026-10-16, the user's choice, proposed at about 55%; `: ReactElement` on every
  component before): typed props, the return type inferred, as the React docs write them. Only a component that a
  package exports keeps an explicit type (`: ReactElement`), so its public type stays stable and readable.
- `react` and `react-dom` are peer dependencies of a package, never dependencies: the app has one React.
- In an app with Mantine: wrap Mantine's ready components (`Select`, `Menu`, `Modal`, …), never look-alikes of our own.
