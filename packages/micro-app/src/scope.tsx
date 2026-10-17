import type { ReactElement, ReactNode } from 'react';
import { useSyncExternalStore } from 'react';

export { MantineScope, usePageScheme };

// The color scheme of the page: the computed CSS `color-scheme` of `<html>`. Only `dark` is dark, only `light` is
// light; anything else follows the system.
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

function usePageScheme(): 'light' | 'dark' {
  return useSyncExternalStore(subscribeScheme, currentScheme);
}

// A scope of Mantine: its variables and color scheme are set on the app's class (`className`, given to the
// `MantineProvider` as `cssVariablesSelector`), not on `:root`, as the app shares its page with others. The app is one
// scope, the content of each dialog another (the dialogs are not inside the app's element). Its color scheme is the
// page's, unless the app gives one (`scheme`, e.g. an element's own in a shadow root).
function MantineScope({ className, scheme, children }: {
  className: string;
  scheme?: 'light' | 'dark';
  children: ReactNode;
}): ReactElement {
  const pageScheme = usePageScheme();

  return (
    <div className={className} data-mantine-color-scheme={scheme ?? pageScheme}>
      {children}
    </div>
  );
}
