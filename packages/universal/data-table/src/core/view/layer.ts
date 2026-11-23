import { createContext } from 'react';

export { LayerContext };

// The element inside the root where popups of the widgets (the list of a select) are rendered. It is inside the root,
// so the popups get the theme values (the custom properties of the root). A portal to the end of the body would lose
// them.
const LayerContext = createContext<HTMLElement | null>(null);
