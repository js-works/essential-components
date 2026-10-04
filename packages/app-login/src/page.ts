import { useSyncExternalStore } from 'react';

export { useLang, useScheme };

// The page's language and color scheme, read from `<html>` (`lang`, and the computed `color-scheme`: only `dark` is
// dark, only `light` is light, anything else follows the system). Any attribute change of `<html>` reads them again;
// there is no event for a changed computed style.

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  const media = matchMedia('(prefers-color-scheme: dark)');

  observer.observe(document.documentElement, { attributes: true });
  media.addEventListener('change', onChange);

  return () => {
    observer.disconnect();
    media.removeEventListener('change', onChange);
  };
}

function currentScheme(): 'light' | 'dark' {
  const words = getComputedStyle(document.documentElement).colorScheme.split(/\s+/);
  const light = words.includes('light');
  const dark = words.includes('dark');

  if (light !== dark) {
    return dark ? 'dark' : 'light';
  }

  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function useScheme(): 'light' | 'dark' {
  return useSyncExternalStore(subscribe, currentScheme);
}

function useLang(): string {
  return useSyncExternalStore(subscribe, () => document.documentElement.lang);
}
