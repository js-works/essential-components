import { describe, expect, it, vi } from 'vitest';

import type { I18nAdapter, StatusViewElement as PublicStatusViewElement } from '../../main/index.js';
import { createStatusViewClass } from '../../main/index.js';

// The element as Lit has it: its `updateComplete` (not in the public type).
type StatusViewElement = PublicStatusViewElement & { readonly updateComplete: Promise<boolean> };

let tags = 0;

// A new class and element each time.
async function mount(
  html = '',
  setup: (view: StatusViewElement) => void = () => {},
  i18n?: I18nAdapter,
): Promise<StatusViewElement> {
  const tag = `test-status-view-${++tags}`;

  customElements.define(tag, createStatusViewClass({ i18n }));
  document.body.insertAdjacentHTML('beforeend', `<${tag}>${html}</${tag}>`);

  const view = document.body.lastElementChild as StatusViewElement;

  setup(view);
  await settle(view);

  return view;
}

// `slotchange` comes in a task of its own, then the render.
async function settle(view: StatusViewElement): Promise<void> {
  await view.updateComplete;
  await new Promise((resolve) => setTimeout(resolve));
  await view.updateComplete;
}

const part = (view: StatusViewElement, selector: string) => view.shadowRoot!.querySelector<HTMLElement>(selector);
const text = (view: StatusViewElement, selector: string) => part(view, selector)?.textContent?.trim();

describe('the status view', () => {
  it('by default: inline, no kind, nothing shown', async () => {
    const view = await mount();

    expect(view.layout).toBe('inline');
    expect(view.kind).toBe('default');
    expect(view.getAttribute('layout')).toBe('inline');
    expect(part(view, '.inline')).not.toBeNull();
    expect(part(view, '.status-icon')?.hidden).toBe(true);
    expect(part(view, '.heading')).toBeNull();
    expect(part(view, '.message')).toBeNull();
    expect(part(view, '.brand')).toBeNull();
    expect(part(view, '.primary')).toBeNull();
    expect(part(view, '.footer')?.hidden).toBe(true);
  });

  it('a kind: its icon, heading and message; the host\'s texts in their place', async () => {
    const view = await mount('', (each) => {
      each.kind = 'no-results';
    });

    expect(part(view, '.status-icon')?.hidden).toBe(false);
    expect(text(view, '.heading')).toBe('No results');
    expect(text(view, '.message')).toBe('Try other search terms or filters.');

    view.heading = 'No boards match';
    await view.updateComplete;
    expect(text(view, '.heading')).toBe('No boards match');
  });

  it('the host\'s texts without a kind; the slot icon shows the icon\'s ground', async () => {
    const view = await mount('<svg slot="icon"></svg>', (each) => {
      each.heading = 'No projects yet';
    });

    expect(text(view, '.heading')).toBe('No projects yet');
    expect(part(view, '.message')).toBeNull();
    expect(part(view, '.status-icon')?.hidden).toBe(false);
  });

  it('the layout screen: a card, the brand with app-title, the heading a h2', async () => {
    const view = await mount('', (each) => {
      each.layout = 'screen';
      each.kind = 'not-found';
      each.appTitle = 'Back Office';
    });

    expect(view.getAttribute('layout')).toBe('screen');
    expect(part(view, '.screen .card .brand')).not.toBeNull();
    expect(text(view, '.title')).toBe('Back Office');
    expect(part(view, 'h2.heading')?.textContent).toBe('Not found');
    expect(view.getAttribute('title')).toBeNull();
  });

  it('the attributes; an invalid one is the default, an invalid value throws', async () => {
    const view = await mount();

    view.setAttribute('kind', 'forbidden');
    view.setAttribute('layout', 'screen');
    expect([view.kind, view.layout]).toEqual(['forbidden', 'screen']);

    view.setAttribute('kind', 'nonsense');
    view.setAttribute('layout', 'nonsense');
    expect([view.kind, view.layout]).toEqual(['default', 'inline']);
    expect(() => {
      view.kind = 'nonsense' as never;
    }).toThrow(RangeError);
    expect(() => {
      view.layout = 'nonsense' as never;
    }).toThrow(RangeError);
  });

  it('the texts through the adapter', async () => {
    const translate = vi.fn((_namespace: string | null, key: string) =>
      key === 'statusViewForbidden' ? 'Kein Zugriff' : null
    );
    const view = await mount('', (each) => {
      each.kind = 'forbidden';
    }, { currentLocale: () => 'de-DE', translate });

    expect(text(view, '.heading')).toBe('Kein Zugriff');
    expect(translate).toHaveBeenCalledWith('cockpit', 'statusViewForbidden', null);
  });

  it('the button fires action; the footer\'s line only with a footer; no children of its own', async () => {
    const view = await mount('<a slot="footer" href="#">Help</a>', (each) => {
      each.actionLabel = 'Try again';
    });
    const onAction = vi.fn();

    document.body.addEventListener('action', onAction);
    part(view, '.primary')!.click();
    document.body.removeEventListener('action', onAction);

    expect(onAction).toHaveBeenCalledOnce();
    expect(part(view, '.footer')?.hidden).toBe(false);
    expect(view.children).toHaveLength(1);
  });
});
