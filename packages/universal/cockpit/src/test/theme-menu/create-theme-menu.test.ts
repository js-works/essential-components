import { describe, expect, it, vi } from 'vitest';

import type { CockpitElement, I18nAdapter, MenuItem, MenuSection, ThemeMenuAccent } from '../../main/index.js';
import { createCockpitClass, createThemeMenu } from '../../main/index.js';

const ACCENTS: readonly ThemeMenuAccent[] = [
  { id: 'indigo', label: 'Indigo', color: '#4c6ef5' },
  { id: 'teal', label: 'Teal', color: '#12b886' },
];

const labelOf = (section: MenuSection) => ('items' in section ? section.label : undefined);
const itemsOf = (section: MenuSection): readonly MenuItem[] => ('items' in section ? section.items : section);
const checkedOf = (section: MenuSection) => itemsOf(section).filter((item) => item.checked?.()).map((item) => item.id);

// The start's `onChange` runs in a microtask.
const settle = () => Promise.resolve();

describe('createThemeMenu', () => {
  it('the color scheme only, by default; with accents and densities three sections', () => {
    expect(createThemeMenu({ onChange: () => {} }).sections.map(labelOf)).toEqual(['Color scheme']);

    const menu = createThemeMenu({ accents: ACCENTS, densities: true, onChange: () => {} });

    expect(menu.sections.map(labelOf)).toEqual(['Color scheme', 'Accent color', 'Density']);
    expect(itemsOf(menu.sections[0]!).map((item) => item.label)).toEqual(['Light', 'System', 'Dark']);
    expect(menu.action.menu).toBe(menu.sections);
    expect(menu.action.label).toBe('Appearance');
  });

  it('the start: the initial choice (else system, the first accent, normal), given to onChange once', async () => {
    const onChange = vi.fn();
    const menu = createThemeMenu({ accents: ACCENTS, densities: true, initial: { scheme: 'dark' }, onChange });

    expect(onChange).not.toHaveBeenCalled();
    await settle();
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ scheme: 'dark', accent: 'indigo', density: 'normal' });
    expect(menu.sections.map(checkedOf)).toEqual([
      ['theme-scheme:dark'],
      ['theme-accent:indigo'],
      ['theme-density:normal'],
    ]);
  });

  it('a choice: checked, given to onChange; nothing is stored', async () => {
    localStorage.clear();

    const onChange = vi.fn();
    const menu = createThemeMenu({ accents: ACCENTS, onChange });

    await settle();
    itemsOf(menu.sections[1]!)[1]!.onSelect!();

    expect(onChange).toHaveBeenLastCalledWith({ scheme: 'system', accent: 'teal', density: 'normal' });
    expect(checkedOf(menu.sections[1]!)).toEqual(['theme-accent:teal']);
    expect(localStorage.length).toBe(0);
  });

  it('a value not offered (e.g. kept by the host, then taken out) is the default; set() by code', () => {
    const onChange = vi.fn();
    const menu = createThemeMenu({
      accents: ACCENTS,
      initial: { scheme: 'sepia' as never, accent: 'gone', density: 'compact' },
      onChange,
    });

    expect(menu.value()).toEqual({ scheme: 'system', accent: 'indigo', density: 'normal' });

    menu.set({ scheme: 'light' });
    expect(menu.value().scheme).toBe('light');
    expect(onChange).toHaveBeenLastCalledWith({ scheme: 'light', accent: 'indigo', density: 'normal' });
  });

  it('the labels through the adapter, read anew (a change of the language)', () => {
    let german = false;
    const i18n: I18nAdapter = {
      currentLocale: () => (german ? 'de-DE' : 'en-US'),
      translate: (
        _namespace,
        key,
      ) => (german
        ? ({ themeMenu: 'Darstellung', themeMenuDark: 'Dunkel' } as Record<string, string>)[key] ?? null
        : null),
    };
    const menu = createThemeMenu({ i18n, onChange: () => {} });

    expect(menu.action.label).toBe('Appearance');
    german = true;
    expect(menu.action.label).toBe('Darstellung');
    expect(itemsOf(menu.sections[0]!)[2]!.label).toBe('Dunkel');
  });

  it('in the cockpit: a radio item shows the check, then its icon (a scheme\'s, an accent\'s swatch)', async () => {
    const menu = createThemeMenu({ accents: ACCENTS, onChange: () => {} });

    customElements.define(
      'test-theme-menu-cockpit',
      createCockpitClass(),
    );

    const cockpit = document.createElement('test-theme-menu-cockpit') as CockpitElement & {
      updateComplete: Promise<unknown>;
    };

    cockpit.actions = [menu.action];
    document.body.append(cockpit);
    await cockpit.updateComplete;

    const teal = cockpit.shadowRoot!.querySelector('[role="menuitemradio"][data-value="theme-accent:teal"]')!;
    const parts = [...teal.children].map((child) => child.className);

    expect(parts).toEqual(['menu-icon menu-check', 'menu-icon', 'menu-label']);
    expect(teal.querySelector('circle')?.getAttribute('fill')).toBe('#12b886');
    expect(cockpit.shadowRoot!.querySelector('[data-value="theme-scheme:dark"] .menu-icon:not(.menu-check) svg'))
      .not.toBeNull();
    cockpit.remove();
  });
});
