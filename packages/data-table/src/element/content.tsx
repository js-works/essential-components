import { useLayoutEffect, useRef } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { DataTable } from '../api';
import * as classes from '../core/view/classes';

export { contentRendererOf, nodeContent };
export type { ContentRenderer };

// Turns the content of the element's API (a string, content of the adapter's type, or a function that returns one of
// them) into React nodes. Strings are rendered by us, as text; everything else by the content adapter.
type ContentRenderer = (value: unknown) => ReactNode;

// The default adapter, for DOM nodes.
const nodeContent: DataTable.ContentAdapter<Node> = {
  render: (content, container) => container.replaceChildren(content),
};

function contentRendererOf(adapter: DataTable.ContentAdapter<unknown>): ContentRenderer {
  // An empty container that React creates and never touches again: the adapter fills it after every render.
  function AdapterContent({ content }: { content: unknown }): ReactElement {
    const ref = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
      if (ref.current !== null) {
        adapter.render(content, ref.current);
      }
    }, [content]);

    useLayoutEffect(() => {
      const container = ref.current;

      return () => {
        if (container !== null) {
          adapter.clear?.(container);
        }
      };
    }, []);

    return <span ref={ref} className={classes.adapterContent} />;
  }

  // A function is called while rendering, so each place gets its own content (a DOM node can be in one place only),
  // and it is called again on every render (e.g. after a change of the language).
  function Content({ value }: { value: unknown }): ReactNode {
    const content: unknown = typeof value === 'function' ? value() : value;

    return typeof content === 'string' ? content : <AdapterContent content={content} />;
  }

  return (value) => (value === undefined ? undefined : <Content value={value} />);
}
