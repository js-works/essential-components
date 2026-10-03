import type { useToast } from '../../../../../packages/overlays/src/main/bindings/react';
import type { Meeting } from '../../../domain';
import type { Dialogs } from '../../../shared/lib/flows';

export { downloadMeetingPdf, previewMeetingPdf, printMeetingPdf };

// The PDF of a meeting (the "PDF" menu of its overview): its report (`report.tsx`, react-pdf) and the preview
// (`preview.tsx`, pdfjs) are loaded on first use, so the app's start stays as it is.

type Toasts = ReturnType<typeof useToast>;

const build = async (meeting: Meeting): Promise<Blob> => (await import('./report')).buildMeetingPdf(meeting.id);

// `Annual review – 2026-09-15.pdf`: the title (without characters a file name may not have) and the date.
function fileName(meeting: Meeting): string {
  return `${meeting.title.replace(/[\\/:*?"<>|]+/g, ' ').trim()} – ${meeting.start.slice(0, 10)}.pdf`;
}

function save(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// Creating a report takes a while on a real server: here at least `CREATE_TIME`, so the dialogs' spinner shows.
const CREATE_TIME = 1200;

// The PDF, built in a scope of the dialogs: until it is ready, the scope shows its spinner placeholder (after a short
// delay), which the next dialog of the scope (the preview) replaces.
async function create(meeting: Meeting): Promise<Blob> {
  const [file] = await Promise.all([build(meeting), new Promise((resolve) => setTimeout(resolve, CREATE_TIME))]);

  return file;
}

// The browser's print dialog for the file: it is loaded into a hidden frame (its PDF viewer), which prints it. The frame
// stays until the next print (the dialog may still be open when `print()` returns), at most one.
let printFrame: HTMLIFrameElement | undefined;

function print(blob: Blob): Promise<void> {
  printFrame?.remove();

  const url = URL.createObjectURL(blob);
  const frame = document.createElement('iframe');

  frame.style.cssText = 'position: fixed; inset-inline-start: -10000px; width: 1px; height: 1px; border: 0;';
  frame.setAttribute('aria-hidden', 'true');
  frame.src = url;
  printFrame = frame;

  return new Promise((resolve, reject) => {
    frame.addEventListener('load', () => {
      try {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        resolve();
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }
    }, { once: true });
    document.body.append(frame);
  });
}

// "Print": the PDF is built (with the spinner), then the browser's print dialog.
async function printMeetingPdf(dialogs: Dialogs, toasts: Toasts, meeting: Meeting): Promise<void> {
  const scope = dialogs.open();

  try {
    const file = await create(meeting);

    scope.dispose();
    await print(file);
  } catch (error) {
    console.error(error);
    toasts.error('The PDF could not be printed.');
  } finally {
    scope.dispose();
  }
}

// "Download": the PDF is built (with the spinner) and saved (no toast: the browser shows the download).
async function downloadMeetingPdf(dialogs: Dialogs, toasts: Toasts, meeting: Meeting): Promise<void> {
  const scope = dialogs.open();

  try {
    save(await create(meeting), fileName(meeting));
  } catch (error) {
    console.error(error);
    toasts.error('The PDF could not be created.');
  } finally {
    scope.dispose();
  }
}

// "Preview": the PDF is built (with the spinner), then an extra wide, maximizable dialog with its pages, "Download"
// (saves the same file) and "Close".
async function previewMeetingPdf(dialogs: Dialogs, toasts: Toasts, meeting: Meeting): Promise<void> {
  const scope = dialogs.open();

  try {
    // The pages are drawn (pdfjs) before the dialog opens, still under the spinner: it opens at its final size.
    const [file, { PdfPages, renderPages }] = await Promise.all([create(meeting), import('./preview')]);
    const pages = await renderPages(file);
    const result = await scope.confirm({
      width: 'extraWide',
      maximizable: true,
      icon: false,
      title: 'PDF preview',
      subtitle: fileName(meeting),
      content: <PdfPages pages={pages} />,
      buttons: { confirm: 'Download', cancel: 'Close' },
    });

    if (!result.canceled) {
      save(file, fileName(meeting));
    }
  } catch (error) {
    console.error(error);
    toasts.error('The PDF could not be created.');
  } finally {
    scope.dispose();
  }
}
