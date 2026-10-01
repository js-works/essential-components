// The design language first, so the CSS of the demos comes after it.
import './ui/ui.css';
import './demo.css';
import { DataNavigatorDemo } from '../packages/data-navigator/demo/DataNavigatorDemo';
import { FileUploadDemo } from '../packages/file-upload/demo/FileUploadDemo';
import { OverlaysDemo } from '../packages/overlays/src/demo/OverlaysDemo';
import { BoardManagerDemo } from './board-manager/BoardManagerDemo';
import { MediaManagerDemo } from './media-manager/MediaManagerDemo';
import { setupUi } from './ui/ui';

// The page: the global switches set `<html lang>` and the color scheme for every demo, and vertical tabs choose the
// demo. Each demo is a light DOM custom element of its project, registered here under a tag name of our choice.
const switches = document.querySelector<HTMLFormElement>('#page-switches');

function apply(): void {
  if (switches === null) {
    return;
  }

  const data = new FormData(switches);

  document.documentElement.lang = String(data.get('language') ?? 'en-US');
  document.documentElement.dataset['scheme'] = String(data.get('scheme') ?? 'light');
}

switches?.addEventListener('change', apply);
apply();
// The tabs of the page. The tabs inside a demo (set up when it connects) are one level deeper: `#file-upload/react`.
setupUi();
customElements.define('file-upload-demo', FileUploadDemo);
customElements.define('data-navigator-demo', DataNavigatorDemo);
customElements.define('overlays-demo', OverlaysDemo);
customElements.define('media-manager-demo', MediaManagerDemo);
customElements.define('board-manager-demo', BoardManagerDemo);
