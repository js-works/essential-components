import { describe, expect, it, vi } from 'vitest';

import type { SystemBannerElement as PublicSystemBannerElement } from '../../main/index.js';
import { createCockpitClass, createSystemBannerClass } from '../../main/index.js';

// The element as Lit has it: its `updateComplete` (not in the public type).
type SystemBannerElement = PublicSystemBannerElement & { readonly updateComplete: Promise<boolean> };

let tags = 0;

// A new class and element each time.
async function mount(html = '', setup: (banner: SystemBannerElement) => void = () => {}): Promise<SystemBannerElement> {
  const tag = `test-system-banner-${++tags}`;

  customElements.define(tag, createSystemBannerClass());
  document.body.insertAdjacentHTML('beforeend', `<${tag}>${html}</${tag}>`);

  const banner = document.body.lastElementChild as SystemBannerElement;

  setup(banner);
  await banner.updateComplete;

  return banner;
}

const part = (banner: SystemBannerElement, selector: string) => banner.shadowRoot!.querySelector<HTMLElement>(selector);

describe('the system banner', () => {
  it('the message, info by default (a status); danger an alert', async () => {
    const banner = await mount('', (each) => {
      each.message = 'Maintenance on Sunday.';
    });

    expect(banner.tone).toBe('info');
    expect(banner.getAttribute('tone')).toBe('info');
    expect(part(banner, '.message')?.textContent).toBe('Maintenance on Sunday.');
    expect(part(banner, '.banner')?.getAttribute('role')).toBe('status');

    banner.tone = 'danger';
    await banner.updateComplete;
    expect(part(banner, '.banner')?.getAttribute('role')).toBe('alert');
  });

  it('without a message, the default slot; no buttons unless asked; no children of its own', async () => {
    const banner = await mount('Read the <a href="#">notes</a>.');

    expect(part(banner, '.message slot')).not.toBeNull();
    expect(part(banner, '.action')).toBeNull();
    expect(part(banner, '.close')).toBeNull();
    expect(banner.children).toHaveLength(1);
  });

  it('the attribute tone; an invalid one is the default, an invalid value throws', async () => {
    const banner = await mount();

    banner.setAttribute('tone', 'warning');
    expect(banner.tone).toBe('warning');
    banner.setAttribute('tone', 'nonsense');
    expect(banner.tone).toBe('info');
    expect(() => {
      banner.tone = 'nonsense' as never;
    }).toThrow(RangeError);
  });

  it('the button fires action; the close button dismiss, which hides it unless canceled', async () => {
    const banner = await mount('', (each) => {
      each.actionLabel = 'Stop';
      each.dismissible = true;
    });
    const onAction = vi.fn();

    banner.addEventListener('action', onAction);
    part(banner, '.action')!.click();
    expect(onAction).toHaveBeenCalledOnce();
    expect(part(banner, '.close')?.getAttribute('aria-label')).toBe('Dismiss');

    const keep = (event: Event) => event.preventDefault();

    banner.addEventListener('dismiss', keep);
    part(banner, '.close')!.click();
    expect(banner.hidden).toBe(false);

    banner.removeEventListener('dismiss', keep);
    part(banner, '.close')!.click();
    expect(banner.hidden).toBe(true);
  });

  it('the cockpit\'s slot banner, above everything', async () => {
    customElements.define('test-banner-cockpit', createCockpitClass({ items: [] }));

    const cockpit = document.createElement('test-banner-cockpit') as HTMLElement & { updateComplete: Promise<unknown> };

    document.body.append(cockpit);
    await cockpit.updateComplete;

    const first = cockpit.shadowRoot!.firstElementChild;

    expect(first?.className).toBe('banners');
    expect(first?.querySelector('slot[name="banner"]')).not.toBeNull();
    cockpit.remove();
  });
});
