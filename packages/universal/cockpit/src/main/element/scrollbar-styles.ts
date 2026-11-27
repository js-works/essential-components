export { overlayScrollbarStyles };

// A scroll area's scrollbar like an overlay scrollbar (the cockpit's sidebar, the nav tree's list): visible only while
// the pointer is over the area or the focus is inside (then one can scroll), transparent otherwise but always there,
// so nothing shifts when it shows.
// - Firefox: the standard properties, a thin scrollbar.
// - Chrome, Edge, Safari: `::-webkit-scrollbar`, which they ignore while `scrollbar-width` or `scrollbar-color` is set
//   (hence `auto` there): a scrollbar of a fixed width (10px) with the thumb drawn narrow inside it (a transparent
//   border, `background-clip: padding-box`), wider while the pointer is on it (a thinner border). No standard CSS
//   can widen it on hover, and a change of the width would shift the content.
function overlayScrollbarStyles(selector: string, thumbColor: string): string {
  return /* css */ `
${selector} {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

${selector}:hover,
${selector}:focus-within {
  scrollbar-color: ${thumbColor} transparent;
}

@supports selector(::-webkit-scrollbar) {
  ${selector},
  ${selector}:hover,
  ${selector}:focus-within {
    scrollbar-width: auto;
    scrollbar-color: auto;
  }

  ${selector}::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ${selector}::-webkit-scrollbar-track,
  ${selector}::-webkit-scrollbar-corner {
    background: transparent;
  }

  ${selector}::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    border-radius: 5px;
    background-color: transparent;
    background-clip: padding-box;
  }

  ${selector}:hover::-webkit-scrollbar-thumb,
  ${selector}:focus-within::-webkit-scrollbar-thumb {
    background-color: ${thumbColor};
  }

  ${selector}::-webkit-scrollbar-thumb:hover {
    border-width: 1px;
  }
}
`;
}
