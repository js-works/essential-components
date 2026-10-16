export { PlannedDemo };

// The placeholder of a planned component (the "Planned" entries of the page's cockpit): what it will be, and that there
// is no demo yet. Light DOM, styled by `ui.css`; its texts come from its attributes (`description`, `note`).
class PlannedDemo extends HTMLElement {
  connectedCallback(): void {
    if (this.childElementCount > 0) {
      return;
    }

    const description = document.createElement('p');
    const note = document.createElement('p');

    this.className = 'ui-stack';
    description.textContent = this.getAttribute('description') ?? '';
    note.className = 'ui-note planned-demo__note';
    note.textContent = this.getAttribute('note') ?? 'Planned: there is no demo yet.';
    this.append(description, note);
  }
}
