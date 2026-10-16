export { CURRENT_USER, typeOf };

// The user of the page: new documents are theirs.
const CURRENT_USER = 'Admin';

// The extension in capitals, or `FILE` for a name without one.
function typeOf(name: string): string {
  const dot = name.lastIndexOf('.');

  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1).toUpperCase() : 'FILE';
}
