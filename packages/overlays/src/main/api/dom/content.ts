export type { Attrs, Child, DomDialogContent, DomToastContent };

type DomDialogContent = Node;

type DomToastContent = string | Node;

/** A child of `h()`: Nodes are appended, strings and numbers become text, arrays are flattened. */
type Child = Node | string | number | boolean | null | undefined | Child[];

/** The props of `h()`. */
type Attrs = Record<string, unknown>;
