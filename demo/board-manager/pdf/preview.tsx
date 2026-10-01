import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&inline';
import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';

export { PdfPages, renderPages };

// The pages of a PDF, drawn by pdfjs into canvases before the preview opens (meanwhile the dialogs' spinner shows), so
// the dialog opens at its final size with its pages. The worker is inlined into the bundle (`?worker&inline`), so the
// single-module `<board-manager>` build needs no file of its own for it. Loaded on first use (a dynamic import, see
// `pdf/index.tsx`).

GlobalWorkerOptions.workerPort = new PdfWorker();

// Sharper than the screen: the canvas has more pixels than its CSS size.
const RESOLUTION = 2;

// Every page of the file as a canvas (`.board-manager__pdf-page`, as wide as the dialog).
async function renderPages(file: Blob): Promise<HTMLCanvasElement[]> {
  const task = getDocument({ data: new Uint8Array(await file.arrayBuffer()) });

  try {
    const document = await task.promise;
    const canvases: HTMLCanvasElement[] = [];

    for (let number = 1; number <= document.numPages; number++) {
      const page = await document.getPage(number);
      const viewport = page.getViewport({ scale: RESOLUTION });
      const canvas = window.document.createElement('canvas');

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.className = 'board-manager__pdf-page';
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `Page ${number} of ${document.numPages}`);
      await page.render({ canvas, viewport }).promise;
      canvases.push(canvas);
    }

    return canvases;
  } finally {
    void task.destroy();
  }
}

// The drawn pages, one below the other.
function PdfPages({ pages }: { pages: readonly HTMLCanvasElement[] }): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.replaceChildren(...pages);
  }, [pages]);

  return <div ref={containerRef} className="board-manager__pdf-pages" />;
}
