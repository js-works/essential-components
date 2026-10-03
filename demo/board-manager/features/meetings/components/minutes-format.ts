export { parseMinutes };

// The stored form of the minutes (`AgendaItem.minutes`), without BlockNote itself, so a reader that only needs the
// blocks (the PDF report) does not load the editor: the JSON of BlockNote's blocks, `''` for none, or plain text (the
// seed: one paragraph per line).

// The stored minutes as BlockNote's (partial) blocks; `undefined` for none.
function parseMinutes(minutes: string): unknown[] | undefined {
  if (minutes.trim() === '') {
    return undefined;
  }

  if (minutes.startsWith('[')) {
    try {
      return JSON.parse(minutes) as unknown[];
    } catch {
      // Plain text that starts with a bracket.
    }
  }

  return minutes.split('\n').map((line) => ({ type: 'paragraph', content: line }));
}
