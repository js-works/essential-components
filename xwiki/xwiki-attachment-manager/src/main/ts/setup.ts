import { render } from 'lit';
import type { TemplateResult } from 'lit';
import { setupDataTable } from '../../../../../packages/data-table/src';
import type { DataTable } from '../../../../../packages/data-table/src';
import { defaultTheme } from '../../../../../packages/data-table/src/themes';
import { createFileUploadClass } from '../../../../../packages/file-upload/src';
import { litDialogAdapter, litToastAdapter } from '../../../../../packages/overlays/src/main/bindings/lit/index';
import { createDialogsController, createToastController } from '../../../../../packages/overlays/src/main/index';

export { createTableController, dialogs, FileUploadElement, TableElement, toasts };

// The components of this monorepo, set up once: the data table's element with Lit templates as content, the file
// upload's element, and the dialogs and toasts (their Lit binding). The tags are registered in main.ts.

const litContent: DataTable.ContentAdapter<TemplateResult> = {
  render: (content, container) => render(content, container),
};

const [TableBase, createTableController] = setupDataTable({ theme: defaultTheme, content: litContent });

class TableElement extends TableBase {}

class FileUploadElement extends createFileUploadClass() {}

const dialogs = createDialogsController({ adapter: litDialogAdapter, icons: true });

const toasts = createToastController({
  adapter: litToastAdapter,
  placement: 'bottom-end',
  size: 'medium',
  appearance: 'solid',
  stacked: true,
});
