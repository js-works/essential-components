import type { ReactElement } from 'react';
import {
  TbArrowRight,
  TbArrowUp,
  TbCopyMinus,
  TbDownload,
  TbFile,
  TbFileSpreadsheet,
  TbFileText,
  TbFileZip,
  TbFolder,
  TbFolderFilled,
  TbFolderOpen,
  TbFolderSymlink,
  TbFolders,
  TbInfoCircle,
  TbMusic,
  TbPencil,
  TbPhoto,
  TbPresentation,
  TbRestore,
  TbServer2,
  TbStar,
  TbStarFilled,
  TbTrash,
  TbUpload,
  TbVideo,
} from 'react-icons/tb';

import type { FileKind } from '../../domain/index.js';

export { appIcons, kindIcon };

// The icons of the app: the Tabler icons of react-icons, in the current text color.
const appIcons = {
  app: <TbFolders size={22} aria-hidden />,
  folder: <TbFolderFilled size={18} aria-hidden />,
  // The trees' folder: only outline icons there (2026-10-07, the user's wish).
  treeFolder: <TbFolder size={18} aria-hidden />,
  storage: <TbServer2 size={18} aria-hidden />,
  upload: <TbUpload size={16} aria-hidden />,
  move: <TbFolderSymlink size={16} aria-hidden />,
  rename: <TbPencil size={16} aria-hidden />,
  remove: <TbTrash size={16} aria-hidden />,
  info: <TbInfoCircle size={16} aria-hidden />,
  download: <TbDownload size={16} aria-hidden />,
  openFolder: <TbFolderOpen size={16} aria-hidden />,
  up: <TbArrowUp size={16} aria-hidden />,
  collapseAll: <TbCopyMinus size={16} aria-hidden />,
  // The arrow after the name of the page a card of the start page opens.
  target: <TbArrowRight size={12} aria-hidden />,
  restore: <TbRestore size={16} aria-hidden />,
  // The star of a favorite (2026-10-08): an outline, filled while it is one.
  star: <TbStar size={16} aria-hidden />,
  starFilled: <TbStarFilled size={16} aria-hidden />,
};

const KIND_ICONS: Readonly<Record<FileKind, (props: { size: number }) => ReactElement>> = {
  image: (props) => <TbPhoto {...props} aria-hidden />,
  video: (props) => <TbVideo {...props} aria-hidden />,
  audio: (props) => <TbMusic {...props} aria-hidden />,
  document: (props) => <TbFileText {...props} aria-hidden />,
  spreadsheet: (props) => <TbFileSpreadsheet {...props} aria-hidden />,
  presentation: (props) => <TbPresentation {...props} aria-hidden />,
  archive: (props) => <TbFileZip {...props} aria-hidden />,
  other: (props) => <TbFile {...props} aria-hidden />,
};

// The icon of a kind of file.
function kindIcon(kind: FileKind, size = 18): ReactElement {
  return KIND_ICONS[kind]({ size });
}
