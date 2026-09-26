import type { FileUpload } from '../src';

export { createUpload, isUploadBehavior };
export type { UploadBehavior };

const BEHAVIORS = ['works', 'slow', 'flaky', 'fails'] as const;

type UploadBehavior = (typeof BEHAVIORS)[number];

const TICK = 100;

function isUploadBehavior(value: string): value is UploadBehavior {
  return BEHAVIORS.some((behavior) => behavior === value);
}

// A fake server: the time depends on the size of the file. It reports its progress, stops as soon as the signal is
// aborted, like a fetch would, and answers with an id for the file (the form value).
function createUpload(behavior: UploadBehavior): FileUpload.Upload {
  return (file, { signal, onProgress }) =>
    new Promise<string>((resolve, reject) => {
      const base = Math.min(5000, 1500 + file.size / 500);
      const duration = behavior === 'slow' ? base * 4 : base;
      const failAt = behavior === 'fails' ? 0.6 : behavior === 'flaky' && Math.random() < 0.5
        ? 0.2 + Math.random() * 0.7
        : undefined;
      let elapsed = 0;

      const stop = () => clearInterval(timer);

      const timer = setInterval(() => {
        elapsed += TICK;

        const fraction = elapsed / duration;

        if (failAt !== undefined && fraction >= failAt) {
          stop();
          reject(new Error('The server did not answer'));
        } else if (fraction >= 1) {
          stop();
          resolve(`srv-${crypto.randomUUID().slice(0, 8)}`);
        } else {
          onProgress(fraction);
        }
      }, TICK);

      signal.addEventListener('abort', () => {
        stop();
        reject(signal.reason);
      }, { once: true });
    });
}
