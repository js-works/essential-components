export { HOST_ATTRIBUTE, provideStyles };

// Set on every element, so our stylesheet can make it a block without knowing its tag name.
const HOST_ATTRIBUTE = 'data-data-table-host';

const HOST_STYLES = `[${HOST_ATTRIBUTE}] { display: block; }`;

// The documents and shadow roots that have the host styles already.
const provided = new WeakSet<Node>();

// The element renders into its light DOM, so the styles have to be where the element is: once per document, or once
// per shadow root when the element sits inside one (e.g. in the template of another component). The stylesheet of the
// table's theme is provided by the table itself (see core/stylesheet.ts).
function provideStyles(element: HTMLElement): void {
  const root = element.getRootNode();
  const target = root instanceof ShadowRoot ? root : element.ownerDocument.head;

  if (provided.has(target)) {
    return;
  }

  provided.add(target);

  const style = element.ownerDocument.createElement('style');

  style.textContent = HOST_STYLES;
  target.prepend(style);
}
