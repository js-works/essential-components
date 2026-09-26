import { useCallback, useState } from 'react';
import type { ReactElement } from 'react';
import { toast, toastIcon, toasts as stack } from './Demo.module.css';
import { icons } from './icons';

export { useToasts };

const DURATION = 3000;

type Toast = { id: number; message: string };

let nextId = 0;

// Short messages in the corner of the page, each for three seconds. The demo actions report with them.
function useToasts(): { show: (message: string) => void; toasts: ReactElement } {
  const [toasts, setToasts] = useState<readonly Toast[]>([]);

  const show = useCallback((message: string) => {
    const id = nextId++;

    setToasts((current) => [...current, { id, message }]);
    setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), DURATION);
  }, []);

  return {
    show,
    toasts: (
      <div className={stack} role="status">
        {toasts.map((item) => (
          <div key={item.id} className={toast}>
            <span className={toastIcon}>{icons.info}</span>
            {item.message}
          </div>
        ))}
      </div>
    ),
  };
}
