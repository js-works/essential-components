export type { TextKey, TextParams };

type TextParams = {
  dropHint: null;
  browse: null;
  hintAccept: { types: string };
  hintMaxFiles: { count: number };
  hintMaxFileSize: { size: string };
  fileList: null;
  statusReady: null;
  statusQueued: null;
  statusUploading: { percent: number };
  statusDone: null;
  statusError: null;
  statusAborted: null;
  rejectedType: null;
  rejectedSize: { size: string };
  rejectedCount: { count: number };
  upload: null;
  uploadAll: null;
  clear: null;
  cancel: null;
  stop: null;
  retry: null;
  remove: null;
  showPreview: null;
  closePreview: null;
  validationFailed: null;
  validationPending: null;
  validationRequired: null;
};

type TextKey = keyof TextParams;
