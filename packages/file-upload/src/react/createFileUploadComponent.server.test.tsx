import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createFileUploadComponent } from './createFileUploadComponent';

// Plain Node, without any DOM: the wrapper must neither touch `HTMLElement` when it is imported nor when it renders.
describe('createFileUploadComponent on the server', () => {
  it('renders a placeholder with the height of the empty element', () => {
    const Upload = createFileUploadComponent({ theme: { fontSize: '1rem' } });
    const html = renderToString(<Upload id="files" className="upload" style={{ margin: '1em' }} />);

    expect(html).toBe(
      '<div id="files" class="upload" style="font-size:1rem;min-height:calc(3.52em + 4px);margin:1em" aria-busy="true">'
        + '</div>',
    );
  });

  it('gives the placeholder the height of its density', () => {
    const Upload = createFileUploadComponent();
    const heightOf = (density: 'compact' | 'comfortable') =>
      /min-height:([^;"]+)/.exec(renderToString(<Upload density={density} />))?.[1];

    expect(heightOf('compact')).toBe('calc(2.948em + 4px)');
    expect(heightOf('comfortable')).toBe('calc(4.664em + 4px)');
  });
});
