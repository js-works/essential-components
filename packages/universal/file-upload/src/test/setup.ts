import { afterEach } from 'vitest';

afterEach(() => {
  document.body.replaceChildren();
});

// jsdom has no popover API.
HTMLElement.prototype.showPopover ??= function(this: HTMLElement) {
  this.toggleAttribute('data-popover-open', true);
};

HTMLElement.prototype.hidePopover ??= function(this: HTMLElement) {
  this.removeAttribute('data-popover-open');
};

// jsdom has no modal dialogs.
HTMLDialogElement.prototype.showModal ??= function(this: HTMLDialogElement) {
  this.open = true;
};

HTMLDialogElement.prototype.close ??= function(this: HTMLDialogElement) {
  if (this.open) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  }
};

// jsdom has no form association (it is tested in the browser mode, see `*.browser.test.ts`).
ElementInternals.prototype.setFormValue ??= () => {};
ElementInternals.prototype.setValidity ??= () => {};

// Node has its own `URL.createObjectURL`, which does not know the `File` of jsdom.
URL.createObjectURL = () => 'blob:test';
URL.revokeObjectURL = () => {};
