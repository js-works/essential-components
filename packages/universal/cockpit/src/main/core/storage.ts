export { readStored, writeStored };

// The cockpit remembers a few things per browser (the recent apps, the collapsed sidebar, the open groups). Storage
// can be missing or throw (a private window, blocked site data): then nothing is remembered, and nothing breaks.
function readStored<T>(key: string, fallback: T): T {
  try {
    const text = localStorage.getItem(key);

    return text === null ? fallback : (JSON.parse(text) as T);
  } catch {
    return fallback;
  }
}

function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Not remembered.
  }
}
