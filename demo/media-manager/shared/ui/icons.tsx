import type { ReactElement } from 'react';
import { IoMdHome } from 'react-icons/io';
import {
  TbArrowLeft,
  TbArrowRight,
  TbDownload,
  TbFile,
  TbFileSpreadsheet,
  TbFileText,
  TbFileZip,
  TbFolder,
  TbFolderFilled,
  TbFolderPlus,
  TbFolders,
  TbFolderSymlink,
  TbInfoCircle,
  TbMusic,
  TbPencil,
  TbPhoto,
  TbPresentation,
  TbTrash,
  TbUpload,
  TbVideo,
} from 'react-icons/tb';
import type { FileKind } from '../../domain';

export { appIcons, kindIcon };

// The icons of the app: the Tabler icons of react-icons, in the current text color.
const appIcons = {
  app: <TbFolders size={22} aria-hidden />,
  home: <IoMdHome size={18} aria-hidden />,
  root: <TbFolder size={18} aria-hidden />,
  folder: <TbFolderFilled size={18} aria-hidden />,
  newFolder: <TbFolderPlus size={16} aria-hidden />,
  upload: <TbUpload size={16} aria-hidden />,
  move: <TbFolderSymlink size={16} aria-hidden />,
  rename: <TbPencil size={16} aria-hidden />,
  remove: <TbTrash size={16} aria-hidden />,
  info: <TbInfoCircle size={16} aria-hidden />,
  download: <TbDownload size={16} aria-hidden />,
  open: <TbArrowRight size={16} aria-hidden />,
  back: <TbArrowLeft size={18} aria-hidden />,
  forward: <TbArrowRight size={18} aria-hidden />,
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
