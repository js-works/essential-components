export type { ContentAdapter, TextContent };

type ContentAdapter<C> = {
  render: (content: C, container: HTMLElement) => void;
  clear?: (container: HTMLElement) => void;
};

type TextContent<C> = string | (() => string | C);
