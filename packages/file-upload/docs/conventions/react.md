# React conventions

- Function components and hooks only. No class components.
- `react` and `react-dom` are peer dependencies of a package, never dependencies: the app has one React.
- In an app with Mantine: wrap Mantine's ready components (`Select`, `Menu`, `Modal`, …), never look-alikes of our own.
