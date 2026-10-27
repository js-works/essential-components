# React conventions

- Function components and hooks only. No class components.
- No return type on a component: typed props, the return type inferred, as the React docs write them. Only a
  component that a package exports keeps an explicit type (`: ReactElement`), so its public type stays stable and
  readable.
- The props' type (the React docs' rule): inline for one prop (`function StatusBadge({ status }: { status:
  MeetingStatus })`), a named `<Component>Props` for two or more, one prop per line, declared right above the
  component. An exported component always has a named one. Not inline over several lines: Prettier also breaks the
  destructuring then, so the names stand twice in two blocks.
  ```tsx
  type MeetingRowProps = {
    meeting: Meeting;
    onOpen: (meeting: Meeting) => void;
  };

  function MeetingRow({ meeting, onOpen }: MeetingRowProps) { … }
  ```
- `react` and `react-dom` are peer dependencies of a package, never dependencies: the app has one React.
- In an app with Mantine: wrap Mantine's ready components (`Select`, `Menu`, `Modal`, …), never look-alikes of our own.
