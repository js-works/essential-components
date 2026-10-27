export type { FileUploadTexts };

type FileUploadTexts = {
  dropHint: string; // Drag files here or
  browse: string; // Browse
  hintAccept: (params: { types: string }) => string; // Allowed: {types}
  hintMaxFiles: (params: { count: number }) => string; // Maximum number of files: {count}
  hintMaxFileSize: (params: { size: string }) => string; // Maximum size per file: {size}
  fileList: string; // Files
  statusReady: string; // Ready to upload
  statusQueued: string; // Waiting
  statusUploading: (params: { percent: number }) => string; // Uploading {percent}%
  statusDone: string; // Uploaded
  statusError: string; // Upload failed
  statusAborted: string; // Canceled
  rejectedType: string; // This file type is not allowed
  rejectedSize: (params: { size: string }) => string; // The file is larger than {size}
  rejectedCount: (params: { count: number }) => string; // Too many files, the maximum is {count}
  upload: string; // Upload
  uploadAll: string; // Upload all
  clear: string; // Clear
  cancel: string; // Cancel
  stop: string; // Stop
  retry: string; // Retry
  remove: string; // Remove
  showPreview: string; // Show preview
  closePreview: string; // Close preview
  validationFailed: string; // Retry or remove the files that failed.
  validationPending: string; // Wait until all uploads are finished.
  validationRequired: string; // Please add a file.
};
