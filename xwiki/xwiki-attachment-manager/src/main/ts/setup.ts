import { render } from 'lit';
import type { TemplateResult } from 'lit';
import { setupDataNavigator } from '../../../../../packages/data-navigator/src';
import type { DataNavigator } from '../../../../../packages/data-navigator/src';
import { defaultTheme } from '../../../../../packages/data-navigator/src/themes';
import { createFileUploadClass } from '../../../../../packages/file-upload/src';
import { litDialogAdapter, litToastAdapter } from '../../../../../packages/overlays/src/main/bindings/lit/index';
import { createDialogsController, createToastController } from '../../../../../packages/overlays/src/main/index';

export { createNavigatorController, dialogs, FileUploadElement, NavigatorElement, toasts };

// The components of this monorepo, set up once: the data navigator's element with Lit templates as content, the file
// upload's element, and the dialogs and toasts (their Lit binding). The tags are registered in main.ts.

const litContent: DataNavigator.ContentAdapter<TemplateResult> = {
  render: (content, container) => render(content, container),
};

const [NavigatorBase, createNavigatorController] = setupDataNavigator({ theme: defaultTheme, content: litContent });

class NavigatorElement extends NavigatorBase {}

class FileUploadElement extends createFileUploadClass() {}

const dialogs = createDialogsController({ adapter: litDialogAdapter, icons: true });

const toasts = createToastController({
  adapter: litToastAdapter,
  placement: 'bottom-end',
  size: 'medium',
  appearance: 'solid',
  stacked: true,
});
