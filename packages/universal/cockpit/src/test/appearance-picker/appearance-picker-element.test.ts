import { describe, expect, it, vi } from 'vitest';

import type {
  AppearanceAccent,
  I18nAdapter,
  AppearancePickerElement as PublicAppearancePickerElement,
} from '../../main/index.js';
import { createAppearancePickerClass } from '../../main/index.js';

// The element as Lit has it: its `updateComplete` (not in the public type).
type AppearancePickerElement = PublicAppearancePickerElement & { readonly updateComplete: Promise<boolean> };

const ACCENTS: readonly AppearanceAccent[] = [
  { id: 'indigo', label: 'Indigo', color: '#4c6ef5' },
  { id: 'teal', label: 'Teal', color: '#0ca678' },
  { id: 'red', label: 'Red', color: '#fa5252' },
];

let tags = 0;

// A new class and element each time.
async function mount(
  setup: (picker: AppearancePickerElement) => void = () => {},
  i18n?: I18nAdapter,
): Promise<AppearancePickerElement> {
  const tag = `test-appearance-picker-${++tags}`;

  customElements.define(tag, createAppearancePickerClass({ i18n }));

  const picker = document.createElement(tag) as AppearancePickerElement;

  setup(picker);
  document.body.append(picker);
  await picker.updateComplete;

  return picker;
}

const radios = (picker: AppearancePickerElement, group: 'scheme' | 'accent') => [
  ...picker.shadowRoot!.querySelectorAll<HTMLButtonElement>(`.${group}-group [role="radio"]`),
];
const checked = (picker: AppearancePickerElement, group: 'scheme' | 'accent') =>
  radios(picker, group).map((radio) => radio.getAttribute('aria-checked') === 'true');

describe('the appearance picker', () => {
  it('Light, System, Dark; System by default; no accents without them', async () => {
    const picker = await mount();

    expect(picker.scheme).toBe('system');
    expect(radios(picker, 'scheme').map((radio) => radio.textContent?.trim())).toEqual(['Light', 'System', 'Dark']);
    expect(checked(picker, 'scheme')).toEqual([false, true, false]);
    expect(radios(picker, 'scheme').map((radio) => radio.tabIndex)).toEqual([-1, 0, -1]);
    expect(picker.shadowRoot!.querySelector('.accent-group')).toBeNull();
  });

  it('a click chooses and fires change (only on a change)', async () => {
    const picker = await mount();
    const onChange = vi.fn(() => picker.scheme);

    picker.addEventListener('change', onChange);
    radios(picker, 'scheme')[2]!.click();
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.results[0]!.value).toBe('dark');

    await picker.updateComplete;
    expect(checked(picker, 'scheme')).toEqual([false, false, true]);

    radios(picker, 'scheme')[2]!.click();
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('the arrow keys choose within a group, wrapping around; Home and End', async () => {
    const picker = await mount();
    const key = (key: string) =>
      radios(picker, 'scheme').find((radio) => radio.tabIndex === 0)!.dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true, composed: true }),
      );

    key('ArrowRight');
    expect(picker.scheme).toBe('dark');
    key('ArrowRight');
    expect(picker.scheme).toBe('light');
    key('ArrowLeft');
    expect(picker.scheme).toBe('dark');
    await picker.updateComplete;
    key('Home');
    expect(picker.scheme).toBe('light');
  });

  it('the accents as swatches with their label; the first the tab stop when none is chosen', async () => {
    const picker = await mount((element) => {
      element.accents = ACCENTS;
    });

    expect(radios(picker, 'accent').map((radio) => radio.getAttribute('aria-label'))).toEqual([
      'Indigo',
      'Teal',
      'Red',
    ]);
    expect(radios(picker, 'accent')[1]!.style.backgroundColor).toBe('rgb(12, 166, 120)');
    expect(checked(picker, 'accent')).toEqual([false, false, false]);
    expect(radios(picker, 'accent')[0]!.tabIndex).toBe(0);

    const onChange = vi.fn();

    picker.addEventListener('change', onChange);
    radios(picker, 'accent')[1]!.click();
    await picker.updateComplete;

    expect(picker.accent).toBe('teal');
    expect(onChange).toHaveBeenCalledOnce();
    expect(checked(picker, 'accent')).toEqual([false, true, false]);
  });

  it('the attribute scheme; an invalid one is the default, an invalid value throws', async () => {
    const picker = await mount();

    picker.setAttribute('scheme', 'dark');
    expect(picker.scheme).toBe('dark');
    picker.setAttribute('scheme', 'nonsense');
    expect(picker.scheme).toBe('system');
    expect(() => {
      picker.scheme = 'nonsense' as never;
    }).toThrow(RangeError);
  });

  it('the texts through the adapter', async () => {
    const picker = await mount(() => {}, {
      currentLocale: () => 'de-DE',
      translate: (_namespace, key) => ({ appearancePickerDark: 'Dunkel' } as Record<string, string>)[key] ?? null,
    });

    expect(radios(picker, 'scheme')[2]!.textContent?.trim()).toBe('Dunkel');
  });
});
