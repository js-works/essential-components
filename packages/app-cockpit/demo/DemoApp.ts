export { DemoApp };

// A stand-in for a real mini-app: its description and two cards. Light DOM, styled by `ui.css`.
class DemoApp extends HTMLElement {
  connectedCallback(): void {
    if (this.childElementCount > 0) {
      return;
    }

    const title = this.getAttribute('app-title') ?? '';
    const note = document.createElement('p');
    const columns = document.createElement('div');

    this.className = 'ui-stack';
    note.className = 'ui-note';
    note.textContent = `${this.getAttribute('description') ?? ''}. A stand-in for a real mini-app.`;
    columns.className = 'ui-columns';
    columns.append(card('Today', `Nothing to do in ${title}.`), card('Recent', 'No recent changes.'));
    this.append(note, columns);
  }
}

function card(heading: string, text: string): HTMLElement {
  const section = document.createElement('section');
  const h2 = document.createElement('h2');
  const p = document.createElement('p');

  section.className = 'ui-stack ui-stack--tight';
  h2.className = 'ui-heading';
  h2.textContent = heading;
  p.textContent = text;
  section.append(h2, p);

  return section;
}
