import type * as Spec from '../api';
import { matchesAccept } from './accept';
import { clamp } from './utils';

export { FileUploadStore };
export type { StoreOptions };

type StoreOptions = {
  upload: Spec.Upload | undefined;
  accept?: string | undefined;
  maxFiles?: number | undefined;
  maxFileSize?: number | undefined;
  maxParallel?: number | undefined;
  multiple?: boolean | undefined;
  manualUpload?: boolean | undefined;
  disabled?: boolean | undefined;
};

const DEFAULT_MAX_PARALLEL = 3;
const NO_FILES: readonly Spec.FileItem[] = [];

// All state and behavior of the file upload, without any framework: validation of the added files, the list with the
// state of each file, the queue (at most `maxParallel` uploads at a time) and the abort of running uploads.
// An adapter subscribes, reads `getItems()` and calls the actions. The public members are arrow functions, so they can
// be passed around unbound.
class FileUploadStore {
  #options: StoreOptions;
  #items = NO_FILES;
  #counter = 0;
  readonly #controllers = new Map<string, AbortController>();
  readonly #listeners = new Set<() => void>();

  constructor(options: StoreOptions) {
    this.#options = options;
  }

  readonly getItems = (): readonly Spec.FileItem[] => this.#items;

  readonly subscribe = (listener: () => void): () => void => {
    this.#listeners.add(listener);

    return () => {
      this.#listeners.delete(listener);
    };
  };

  readonly setOptions = (options: StoreOptions): void => {
    this.#options = options;
    this.#commit(this.#items);
  };

  readonly addFiles = (incoming: readonly File[]): void => {
    const { accept, maxFiles, maxFileSize, multiple = false, manualUpload = false, disabled = false } = this.#options;

    if (disabled || incoming.length === 0) {
      return;
    }

    // Without `multiple` a new file replaces the current one.
    const kept = multiple ? this.#items : NO_FILES;
    const chosen = multiple ? incoming : incoming.slice(0, 1);

    if (!multiple) {
      for (const item of this.#items) {
        this.#abort(item.id);
      }
    }

    let accepted = kept.filter((item) => item.status !== 'rejected').length;

    const added = chosen.map((file): Spec.FileItem => {
      const id = `file-${++this.#counter}`;
      const rejection = rejectionOf(file, accept, maxFileSize, maxFiles, accepted);

      if (rejection !== undefined) {
        return { id, file, status: 'rejected', progress: 0, rejection };
      }

      accepted++;

      return { id, file, status: manualUpload ? 'ready' : 'queued', progress: 0 };
    });

    this.#commit([...kept, ...added]);
  };

  readonly start = (id: string): void => {
    this.#update((item) => (item.id === id && item.status === 'ready' ? { ...item, status: 'queued' } : item));
  };

  readonly startAll = (): void => {
    this.#update((item) => (item.status === 'ready' ? { ...item, status: 'queued' } : item));
  };

  readonly cancel = (id: string): void => {
    this.#abort(id);
    this.#update((item) =>
      item.id === id && (item.status === 'queued' || item.status === 'uploading')
        ? { ...item, status: 'aborted' }
        : item
    );
  };

  readonly retry = (id: string): void => {
    this.#update((item) => {
      if (item.id !== id || (item.status !== 'error' && item.status !== 'aborted')) {
        return item;
      }

      const { error: _error, result: _result, ...rest } = item;

      return { ...rest, status: 'queued', progress: 0 };
    });
  };

  readonly remove = (id: string): void => {
    this.#abort(id);
    this.#commit(this.#items.filter((item) => item.id !== id));
  };

  // Aborts every running upload and empties the list (e.g. on a form reset).
  readonly clear = (): void => {
    if (this.#items.length === 0) {
      return;
    }

    for (const item of this.#items) {
      this.#abort(item.id);
    }

    this.#commit(NO_FILES);
  };

  // Aborts every running and waiting upload (e.g. when the element is removed from the page).
  readonly dispose = (): void => {
    for (const controller of this.#controllers.values()) {
      controller.abort();
    }

    this.#controllers.clear();
    this.#update((item) =>
      item.status === 'queued' || item.status === 'uploading' ? { ...item, status: 'aborted' } : item
    );
  };

  // Maps every item. The list only changes (and the listeners are only called) when an item changes.
  #update(change: (item: Spec.FileItem) => Spec.FileItem): void {
    const next = this.#items.map(change);

    this.#commit(next.every((item, index) => item === this.#items[index]) ? this.#items : next);
  }

  #commit(items: readonly Spec.FileItem[]): void {
    const before = this.#items;

    this.#items = items;
    this.#pump();

    if (this.#items !== before) {
      for (const listener of this.#listeners) {
        listener();
      }
    }
  }

  // The queue: start the waiting files while there is a free slot, in the order of the list. Without an upload function
  // the files keep waiting.
  #pump(): void {
    const { upload, maxParallel = DEFAULT_MAX_PARALLEL } = this.#options;

    if (upload === undefined) {
      return;
    }

    const running = this.#items.filter((item) => item.status === 'uploading').length;
    const next = this.#items.filter((item) => item.status === 'queued').slice(0, Math.max(0, maxParallel - running));

    if (next.length === 0) {
      return;
    }

    const started = new Set(next.map((item) => item.id));

    this.#items = this.#items.map((item) => (started.has(item.id) ? { ...item, status: 'uploading' } : item));

    for (const item of next) {
      this.#begin(item.id, item.file, upload);
    }
  }

  #begin(id: string, file: File, upload: Spec.Upload): void {
    const controller = new AbortController();

    this.#controllers.set(id, controller);

    // A canceled or removed upload has no controller any more: whatever it reports later is ignored.
    const current = () => this.#controllers.get(id) === controller;

    const onProgress = (fraction: number) => {
      if (current()) {
        this.#patch(id, { progress: clamp(fraction, 0, 1) });
      }
    };

    const finish = (changes: Partial<Spec.FileItem>) => {
      if (current()) {
        this.#controllers.delete(id);
        this.#patch(id, changes);
      }
    };

    let promise: Promise<string | void>;

    try {
      promise = upload(file, { signal: controller.signal, onProgress });
    } catch (error) {
      promise = Promise.reject(error);
    }

    promise.then(
      // Only a string is a result (the form value of the file).
      (result) => finish({ status: 'done', progress: 1, ...(typeof result === 'string' ? { result } : {}) }),
      (error: unknown) => finish({ status: 'error', error }),
    );
  }

  #patch(id: string, changes: Partial<Spec.FileItem>): void {
    this.#update((item) => (item.id === id ? { ...item, ...changes } : item));
  }

  #abort(id: string): void {
    this.#controllers.get(id)?.abort();
    this.#controllers.delete(id);
  }
}

function rejectionOf(
  file: File,
  accept: string | undefined,
  maxFileSize: number | undefined,
  maxFiles: number | undefined,
  accepted: number,
): Spec.Rejection | undefined {
  if (!matchesAccept(file, accept)) {
    return 'type';
  }

  if (maxFileSize !== undefined && file.size > maxFileSize) {
    return 'size';
  }

  return maxFiles !== undefined && accepted >= maxFiles ? 'count' : undefined;
}
