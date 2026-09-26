import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createFileUploadComponent } from './createFileUploadComponent';

// Plain Node, without any DOM: the wrapper must neither touch `HTMLElement` when it is imported nor when it renders.
describe('createFileUploadComponent on the server', () => {
  it('renders a placeholder with the height of the empty element', () => {
    const Upload = createFileUploadComponent({ theme: { fontSize: '1rem' } });
    const html = renderToString(<Upload id="files" className="upload" style={{ margin: '1em' }} />);

    expect(html).toBe(
      '<div id="files" class="upload" style="font-size:1rem;min-height:calc(2.75em + 4px);margin:1em" aria-busy="true">'
        + '</div>',
    );
  });
});
