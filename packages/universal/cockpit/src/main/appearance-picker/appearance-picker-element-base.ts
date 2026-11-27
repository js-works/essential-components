import type { TemplateResult } from 'lit';
import { html, LitElement, nothing, svg } from 'lit';

import { I18nController } from '../core/i18n-controller.js';
import { textsOf } from '../core/texts.js';
import type {
  AppearanceAccent,
  AppearancePickerClassConfig,
  AppearancePickerElement,
  AppearanceScheme,
} from '../index.js';

export { AppearancePickerElementBase };

// From light to dark, the system's in the middle.
const SCHEMES = Object.freeze(['light', 'system', 'dark'] as const);

// The icon of each scheme (Tabler's, MIT: `sun`, `device-desktop`, `moon`).
const SCHEME_ICONS = Object.freeze(
  {
    light: svg`<path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0" />
      <path d="M3 12h1m8-9v1m8 8h1m-9 8v1M5.6 5.6l.7 .7m12.1-.7l-.7 .7m0 11.4l.7 .7m-12.1-.7l-.7 .7" />`,
    system: svg`<path d="M3 5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5z" />
      <path d="M7 20h10" /><path d="M9 16v4" /><path d="M15 16v4" />`,
    dark: svg`<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z" />`,
  } as const satisfies Record<AppearanceScheme, unknown>,
);

const SCHEME_TEXTS = Object.freeze(
  { light: 'appearancePickerLight', system: 'appearancePickerSystem', dark: 'appearancePickerDark' } as const,
);

const CHECK = svg`<path d="m5 12 5 5L20 7" />`;

const isScheme = (value: unknown): value is AppearanceScheme => SCHEMES.includes(value as AppearanceScheme);

// The next radio of a group for a key (wrapping around), or `undefined` for another key.
function stepOf(key: string, index: number, count: number): number | undefined {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (index + 1) % count;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (index - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return undefined;
  }
}

// The appearance picker, a Lit element (see `AppearancePickerElement`): two radio groups (the schemes as a segmented
// control, the accents as swatches), each with one tab stop; the arrow keys (Home, End) choose within it. Only a
// shadow root: the element never adds children of its own.
class AppearancePickerElementBase extends LitElement implements AppearancePickerElement {
  static override properties = {
    scheme: { noAccessor: true, reflect: true },
    accents: { attribute: false },
    accent: {},
  };

  declare accents: readonly AppearanceAccent[];
  declare accent: string;

  readonly #sheet: CSSStyleSheet;
  readonly #i18n: I18nController;
  #scheme: AppearanceScheme = 'system';

  constructor(config: AppearancePickerClassConfig, sheet: CSSStyleSheet) {
    super();
    this.accents = [];
    this.accent = '';
    this.#i18n = new I18nController(this, config.i18n);
    this.#sheet = sheet;
  }

  get scheme(): AppearanceScheme {
    return this.#scheme;
  }

  // An invalid value throws; an invalid attribute is the default (`attributeChangedCallback` below).
  set scheme(value: AppearanceScheme) {
    if (!isScheme(value)) {
      throw new RangeError(`Unknown scheme: ${String(value)}`);
    }

    const old = this.#scheme;

    this.#scheme = value;
    this.requestUpdate('scheme', old);
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    if (name === 'scheme') {
      this.scheme = isScheme(value) ? value : 'system';
    } else {
      super.attributeChangedCallback(name, old, value);
    }
  }

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    const root = super.createRenderRoot();

    if (root instanceof ShadowRoot) {
      root.adoptedStyleSheets = [this.#sheet];
    }

    return root;
  }

  // A choice of the user: the property, then `change` (only when it changed).
  #choose(apply: () => boolean): void {
    if (apply()) {
      this.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  #chooseScheme(scheme: AppearanceScheme): void {
    this.#choose(() => {
      const changed = scheme !== this.#scheme;

      this.scheme = scheme;

      return changed;
    });
  }

  #chooseAccent(id: string): void {
    this.#choose(() => {
      const changed = id !== this.accent;

      this.accent = id;

      return changed;
    });
  }

  // The arrow keys in a radio group: the next one is chosen and gets the focus (after the render).
  async #onKeyDown(event: KeyboardEvent, group: 'scheme' | 'accent'): Promise<void> {
    const ids = group === 'scheme' ? [...SCHEMES] : this.accents.map((accent) => accent.id);
    const current = Math.max(0, ids.indexOf(group === 'scheme' ? this.#scheme : this.accent));
    const next = stepOf(event.key, current, ids.length);

    if (next === undefined) {
      return;
    }

    event.preventDefault();

    if (group === 'scheme') {
      this.#chooseScheme(ids[next] as AppearanceScheme);
    } else {
      this.#chooseAccent(ids[next]!);
    }

    await this.updateComplete;
    this.renderRoot.querySelector<HTMLElement>(`.${group}-group [aria-checked='true']`)?.focus();
  }

  protected override render(): TemplateResult {
    const t = textsOf(this.#i18n.adapter);
    const chosen = this.accents.findIndex((accent) => accent.id === this.accent);

    return html`
      <div class="picker">
        <div class="section">
          <span class="label" id="scheme-label">${t.appearancePickerScheme}</span>
          <div
            class="scheme-group"
            role="radiogroup"
            aria-labelledby="scheme-label"
            @keydown=${(event: KeyboardEvent) => void this.#onKeyDown(event, 'scheme')}
          >
            ${
      SCHEMES.map((scheme) => {
        const checked = scheme === this.#scheme;

        return html`<button
                type="button"
                class="scheme"
                role="radio"
                aria-checked=${checked ? 'true' : 'false'}
                tabindex=${checked ? 0 : -1}
                @click=${() => this.#chooseScheme(scheme)}
              >
                <svg class="scheme-icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">${
          SCHEME_ICONS[scheme]
        }</svg>
                <span>${t[SCHEME_TEXTS[scheme]]}</span>
              </button>`;
      })
    }
          </div>
        </div>
        ${this.accents.length === 0 ? nothing : this.#accentSection(t.appearancePickerAccent, chosen)}
      </div>
    `;
  }

  // The swatches: their color as an inline style (a value only known at run time); the first one the tab stop when
  // none is chosen.
  #accentSection(label: string, chosen: number): TemplateResult {
    return html`
      <div class="section">
        <span class="label" id="accent-label">${label}</span>
        <div
          class="accent-group"
          role="radiogroup"
          aria-labelledby="accent-label"
          @keydown=${(event: KeyboardEvent) => void this.#onKeyDown(event, 'accent')}
        >
          ${
      this.accents.map((accent, index) => {
        const checked = index === chosen;

        return html`<button
              type="button"
              class="swatch"
              role="radio"
              aria-checked=${checked ? 'true' : 'false'}
              aria-label=${accent.label}
              title=${accent.label}
              tabindex=${checked || (chosen === -1 && index === 0) ? 0 : -1}
              style="background-color: ${accent.color}"
              @click=${() => this.#chooseAccent(accent.id)}
            >
              ${
          checked
            ? html`<svg class="check" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">${CHECK}</svg>`
            : nothing
        }
            </button>`;
      })
    }
        </div>
      </div>
    `;
  }
}
