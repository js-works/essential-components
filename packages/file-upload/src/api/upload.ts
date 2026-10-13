export type { FileItem, FileStatus, Rejection, Upload, UploadContext };

type UploadContext = {
  signal: AbortSignal;
  onProgress: (fraction: number) => void;
};

type Upload = (file: File, context: UploadContext) => Promise<string | void>;

type FileStatus = 'ready' | 'queued' | 'uploading' | 'done' | 'error' | 'aborted' | 'rejected';

type Rejection = 'type' | 'size' | 'count';

type FileItem = {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  rejection?: Rejection;
  error?: unknown;
  result?: string;
};
