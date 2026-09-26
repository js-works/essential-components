import type * as Spec from '../api';
import type { Localizer } from './texts';

export { actionsOf, hintsOf, invalidityOf, statusIconOf, statusTextOf };
export type { Action, Invalidity, Limits, StatusIcon };

// The actions of a row. They are also the keys of their labels.
type Action = 'upload' | 'cancel' | 'stop' | 'retry' | 'remove';

// The icon in the first column of a row, when it shows no preview.
type StatusIcon = 'file' | 'spinner' | 'done' | 'warning';

// Why the element is invalid as a form control. Each one is also the key of its message.
type Invalidity = 'validationFailed' | 'validationPending' | 'validationRequired';

type Limits = {
  accept: string | undefined;
  maxFiles: number | undefined;
  maxFileSize: number | undefined;
};

const ACTIONS = {
  ready: ['upload', 'remove'],
  queued: ['cancel'],
  uploading: ['stop'],
  done: ['remove'],
  error: ['retry', 'remove'],
  aborted: ['retry', 'remove'],
  rejected: ['remove'],
} as const satisfies Record<Spec.FileStatus, readonly Action[]>;

function actionsOf(status: Spec.FileStatus): readonly Action[] {
  return ACTIONS[status];
}

const STATUS_ICONS = {
  ready: 'file',
  queued: 'file',
  uploading: 'spinner',
  done: 'done',
  error: 'warning',
  aborted: 'file',
  rejected: 'warning',
} as const satisfies Record<Spec.FileStatus, StatusIcon>;

function statusIconOf(status: Spec.FileStatus): StatusIcon {
  return STATUS_ICONS[status];
}

// The hints below the drop area: only for the limits that are set.
function hintsOf(limits: Limits, { text, formatSize }: Localizer): readonly string[] {
  const { accept, maxFiles, maxFileSize } = limits;

  return [
    accept?.trim()
      ? text('hintAccept', { types: accept.split(',').map((type) => type.trim()).join(', ') })
      : undefined,
    maxFiles !== undefined ? text('hintMaxFiles', { count: maxFiles }) : undefined,
    maxFileSize !== undefined ? text('hintMaxFileSize', { size: formatSize(maxFileSize) }) : undefined,
  ].filter((hint) => hint !== undefined);
}

function statusTextOf(item: Spec.FileItem, limits: Limits, { text, formatSize }: Localizer): string {
  switch (item.status) {
    case 'ready':
      return text('statusReady', null);
    case 'queued':
      return text('statusQueued', null);
    case 'uploading':
      return text('statusUploading', { percent: Math.round(item.progress * 100) });
    case 'done':
      return text('statusDone', null);
    case 'error':
      return text('statusError', null);
    case 'aborted':
      return text('statusAborted', null);
    case 'rejected':
      switch (item.rejection ?? 'type') {
        case 'type':
          return text('rejectedType', null);
        case 'size':
          return text('rejectedSize', { size: formatSize(limits.maxFileSize ?? 0) });
        case 'count':
          return text('rejectedCount', { count: limits.maxFiles ?? 0 });
      }
  }
}

// The first failing check wins: failed files, then unfinished ones, then `required` without a done file. Rejected files
// never make the element invalid.
function invalidityOf(items: readonly Spec.FileItem[], required: boolean): Invalidity | undefined {
  const has = (...statuses: readonly Spec.FileStatus[]) => items.some((item) => statuses.includes(item.status));

  if (has('error', 'aborted')) {
    return 'validationFailed';
  }

  if (has('ready', 'queued', 'uploading')) {
    return 'validationPending';
  }

  return required && !has('done') ? 'validationRequired' : undefined;
}
