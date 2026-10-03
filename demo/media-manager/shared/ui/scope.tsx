import { useSyncExternalStore } from 'react';
import type { ReactElement, ReactNode } from 'react';

export { Scope, SCOPE_CLASS, useScheme };

// The color scheme of the page: the computed CSS `color-scheme` of `<html>` (the demo page's switch sets it through
// `ui.css`, `data-scheme`). Only `dark` is dark, only `light` is light; anything else follows the system.
function currentScheme(): 'light' | 'dark' {
  const words = getComputedStyle(document.documentElement).colorScheme.split(/\s+/);
  const light = words.includes('light');
  const dark = words.includes('dark');

  if (light !== dark) {
    return dark ? 'dark' : 'light';
  }

  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// No event for a changed computed style: any attribute change of `<html>` or `<body>` reads it again.
function subscribeScheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  const media = matchMedia('(prefers-color-scheme: dark)');

  observer.observe(document.documentElement, { attributes: true });
  observer.observe(document.body, { attributes: true });
  media.addEventListener('change', onChange);

  return () => {
    observer.disconnect();
    media.removeEventListener('change', onChange);
  };
}

function useScheme(): 'light' | 'dark' {
  return useSyncExternalStore(subscribeScheme, currentScheme);
}

// Mantine's variables and color scheme are set on this class, not on `:root`: the app shares its page with other
// demos. The app is one scope, the content of each dialog another (the dialogs are not inside the app's element).
const SCOPE_CLASS = 'media-manager';

function Scope({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className={SCOPE_CLASS} data-mantine-color-scheme={useScheme()}>
      {children}
    </div>
  );
}
