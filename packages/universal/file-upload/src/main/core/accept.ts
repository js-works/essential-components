export { matchesAccept };

// Like the `accept` attribute of a file input: a comma-separated list of extensions (".pdf"), MIME types
// ("application/pdf") and MIME type wildcards ("image/*"). Empty or missing accepts everything.
function matchesAccept(file: { name: string; type: string }, accept: string | undefined): boolean {
  const tokens = (accept ?? '')
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token !== '');

  if (tokens.length === 0) {
    return true;
  }

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return tokens.some((token) => {
    if (token.startsWith('.')) {
      return name.endsWith(token);
    }

    return token.endsWith('/*') ? type.startsWith(token.slice(0, -1)) : type === token;
  });
}
