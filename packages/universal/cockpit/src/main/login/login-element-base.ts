import type { TemplateResult } from 'lit';
import { html, LitElement, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { I18nController } from '../core/i18n-controller.js';
import type { Texts } from '../core/texts.js';
import { textsOf } from '../core/texts.js';
import { gridIcon } from '../element/icons.js';
import type { LoginClassConfig, LoginElement, LoginProvider } from '../index.js';

export { LoginElementBase };

// The login screen, a Lit element (see `LoginElement`): the layout and its buttons. The screen fills the
// element (at least the window's height); on it a card with the logo, the app's title and subheadline, the view's heading,
// the host's content, the submit button, the providers and the footer; the hint below the card. The host owns its
// content (its forms, their logic): the element never adds children of its own, so the host's inputs are in the light
// DOM, where password managers and autofill find them. The buttons are the element's, in its shadow root: the submit
// button (it submits the host's form) and the providers'.
class LoginElementBase extends LitElement implements LoginElement {
  static override properties = {
    headline: {},
    subheadline: {},
    heading: {},
    submitLabel: { attribute: 'submit-label' },
    submitting: { type: Boolean, reflect: true },
    providers: { attribute: false },
    signInWith: { attribute: false },
  };

  declare headline: string;
  declare subheadline: string;
  declare heading: string;
  declare submitLabel: string;
  declare submitting: boolean;
  declare providers: readonly LoginProvider[];
  declare signInWith: ((providerId: string) => void | Promise<void>) | null;

  readonly #sheet: CSSStyleSheet;
  readonly #i18n: I18nController;
  // Whether the default slot and the slot `footer` have content: the line "or" and the footer's line only then.
  #hasContent = false;
  #hasFooter = false;
  // The provider whose sign in runs.
  #running: string | undefined;
  // A failed sign in with a provider: its message (`undefined`: the login's own text).
  #failure: { message: string | undefined } | undefined;

  constructor(config: LoginClassConfig, sheet: CSSStyleSheet) {
    super();
    this.headline = '';
    this.subheadline = '';
    this.heading = '';
    this.submitLabel = '';
    this.submitting = false;
    this.providers = [];
    this.signInWith = null;
    this.#i18n = new I18nController(this, config.i18n);
    this.#sheet = sheet;
    this.addEventListener('keydown', (event) => this.#enter(event));
  }

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    const root = super.createRenderRoot();

    if (root instanceof ShadowRoot) {
      root.adoptedStyleSheets = [this.#sheet];
    }

    return root;
  }

  // Whether a slot has content (an element, or text that is not only white space).
  #slotChange(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    const filled = slot.assignedNodes().some((node) =>
      node.nodeType === Node.ELEMENT_NODE || (node.textContent ?? '').trim() !== ''
    );

    if (slot.name === 'footer' ? filled !== this.#hasFooter : filled !== this.#hasContent) {
      if (slot.name === 'footer') {
        this.#hasFooter = filled;
      } else {
        this.#hasContent = filled;
      }

      this.requestUpdate();
    }
  }

  // The host's form: the first `<form>` in the default slot (slotted itself, or inside a slotted element).
  #form(): HTMLFormElement | undefined {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot:not([name])');

    for (const element of slot?.assignedElements() ?? []) {
      const form = element instanceof HTMLFormElement ? element : element.querySelector('form');

      if (form !== null) {
        return form;
      }
    }

    return undefined;
  }

  // The submit button is the element's: it submits the host's form (its submit event, the host's checks and handler).
  #submit(): void {
    if (!this.submitting && this.#running === undefined) {
      this.#form()?.requestSubmit();
    }
  }

  // Enter in an input of the host's form submits it, like a submit button of its own: natively, a form with two text
  // inputs and none does nothing (implicit submission). It runs after the input's own handlers (the keydown bubbles
  // from the light DOM to the element), so an input that uses Enter itself (a select's list) has prevented it. Not
  // while an IME composes, not in a textarea, not for a form with a submit button of its own (the browser submits it).
  #enter(event: KeyboardEvent): void {
    const form = this.#form();
    const input = event.target;

    if (
      event.key !== 'Enter' || event.isComposing || event.defaultPrevented || this.submitLabel === ''
      || !(input instanceof HTMLInputElement) || form === undefined || input.form !== form
      || form.querySelector('button[type="submit"], button:not([type]), input[type="submit"]') !== null
    ) {
      return;
    }

    event.preventDefault();
    this.#submit();
  }

  async #choose(id: string): Promise<void> {
    const signInWith = this.signInWith;

    if (signInWith === null || this.#running !== undefined || this.submitting) {
      return;
    }

    this.#running = id;
    this.#failure = undefined;
    this.requestUpdate();

    try {
      await signInWith(id);
    } catch (reason) {
      this.#failure = { message: reason instanceof Error && reason.message !== '' ? reason.message : undefined };
    } finally {
      this.#running = undefined;
      this.requestUpdate();
    }
  }

  protected override render(): TemplateResult {
    const t = textsOf(this.#i18n.adapter);
    const providers = this.signInWith === null ? [] : this.providers;

    return html`
      <div class="screen">
        <div class="column">
          <main class="card">
            <div class="brand">
              <span class="logo" aria-hidden="true"><slot name="logo">${gridIcon()}</slot></span>
              <div>
                <h1 class="title">${this.headline}</h1>
                ${this.subheadline === '' ? nothing : html`<p class="subtitle">${this.subheadline}</p>`}
              </div>
            </div>
            ${this.heading === '' ? nothing : html`<h2 class="heading">${this.heading}</h2>`}
            <slot @slotchange=${this.#slotChange}></slot>
            ${this.submitLabel === '' ? nothing : this.#submitTemplate()}
            ${providers.length > 0 && this.#hasContent ? html`<div class="or">${t.loginOr}</div>` : nothing}
            ${providers.length > 0 ? this.#providersTemplate(providers, t) : nothing}
            <div class="footer" ?hidden=${!this.#hasFooter}>
              <slot name="footer" @slotchange=${this.#slotChange}></slot>
            </div>
          </main>
          <slot name="hint"></slot>
        </div>
      </div>
    `;
  }

  // Its spinner while the host's handler runs (`submitting`); disabled while a provider's sign in runs.
  #submitTemplate(): TemplateResult {
    return html`
      <button
        class="primary"
        type="button"
        ?disabled=${this.#running !== undefined}
        aria-busy=${this.submitting ? 'true' : 'false'}
        @click=${this.#submit}
      >
        ${
      this.submitting ? html`<span class="spinner" aria-hidden="true"></span>` : nothing
    }<span>${this.submitLabel}</span>
      </button>
    `;
  }

  // The clicked button shows the spinner, the others are disabled while it runs; a failure's message below them.
  #providersTemplate(providers: readonly LoginProvider[], t: Texts): TemplateResult {
    return html`
      <div class="providers">
        ${
      providers.map((provider) => {
        const running = this.#running === provider.id;
        const icon = running
          ? html`<span class="spinner" aria-hidden="true"></span>`
          : provider.icon === undefined
          ? nothing
          : html`<span class="provider-icon" aria-hidden="true">${unsafeHTML(provider.icon)}</span>`;

        return html`
            <button
              class="provider"
              type="button"
              ?disabled=${(this.#running !== undefined && !running) || this.submitting}
              aria-busy=${running ? 'true' : 'false'}
              @click=${() => void this.#choose(provider.id)}
            >
              ${icon}<span>${t.loginContinueWith({ provider: provider.label })}</span>
            </button>
          `;
      })
    }
        ${
      this.#failure === undefined
        ? nothing
        : html`<p class="alert" role="alert">${this.#failure.message ?? t.loginProviderFailed}</p>`
    }
      </div>
    `;
  }
}
