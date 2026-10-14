export type { FileItem, FileRejection, FileStatus, UploadContext, UploadFn };

type UploadContext = {
  signal: AbortSignal;
  onProgress: (fraction: number) => void;
};

type UploadFn = (file: File, context: UploadContext) => Promise<string | void>;

type FileStatus = 'ready' | 'queued' | 'uploading' | 'done' | 'error' | 'aborted' | 'rejected';

type FileRejection = 'type' | 'size' | 'count';

type FileItem = {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  rejection?: FileRejection;
  error?: unknown;
  result?: string;
};
