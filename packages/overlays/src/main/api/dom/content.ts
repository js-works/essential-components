export type { DomAttrs, DomChild, DomDialogContent, DomToastContent };

type DomDialogContent = Node;

type DomToastContent = string | Node;

/** A child of `h()`: Nodes are appended, strings and numbers become text, arrays are flattened. */
type DomChild = Node | string | number | boolean | null | undefined | DomChild[];

/** The props of `h()`. */
type DomAttrs = Record<string, unknown>;
