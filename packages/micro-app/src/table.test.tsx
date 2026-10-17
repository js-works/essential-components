import { MantineProvider } from '@mantine/core';
import { cleanup, render, renderHook, screen, waitFor } from '@testing-library/react';
import { createInstance } from 'i18next';
import type { ReactNode } from 'react';
import { initReactI18next } from 'react-i18next';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { SavedFilterStore } from '@local/data-table/react';

import { MicroAppProvider } from './provider.js';
import { DataTable, useSavedTableFilters } from './table.js';
import { useTableActions } from './table-actions.js';
import { microAppResources } from './texts.js';

beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(cleanup);

const store: SavedFilterStore = {
  list: async () => [{ id: 'c1', name: 'Theirs', filters: {}, shared: true, owner: 'Ann' }],
  save: async () => {},
  remove: async () => {},
  setShared: async () => {},
};

function wrapper(language: string) {
  const i18n = createInstance();

  void i18n.use(initReactI18next).init({ lng: language, resources: microAppResources, initAsync: false });

  return ({ children }: { children: ReactNode }) => (
    <MicroAppProvider i18n={i18n} savedFilters={store}>
      <MantineProvider>{children}</MantineProvider>
    </MicroAppProvider>
  );
}

type Person = { id: number; name: string };

describe('DataTable', () => {
  it('shows the rows, with the data table\'s texts in the app\'s language', async () => {
    render(
      <DataTable<Person>
        source={async () => ({ rows: [{ id: 1, name: 'Ann' }], total: 1 })}
        rowKey="id"
        columns={[{ key: 'name', header: 'Name' }]}
        searchable
      />,
      { wrapper: wrapper('de') },
    );

    await waitFor(() => expect(screen.getByText('Ann')).toBeTruthy());

    expect(screen.getByRole('textbox', { name: 'Suchen' })).toBeTruthy();
    expect(document.querySelector('.micro-app__table')).toBeTruthy();
  });
});

describe('useTableActions', () => {
  it('builds the standard actions with the texts of the language', () => {
    const { result } = renderHook(() => useTableActions(), { wrapper: wrapper('de') });
    const { newAction, openAction, editAction, deleteAction } = result.current;

    expect(newAction('Neuer Benutzer', () => {})).toMatchObject({
      key: 'new',
      label: 'Neuer Benutzer',
      variant: 'primary',
    });
    expect(openAction(() => {})).toMatchObject({ key: 'open', tip: 'Öffnen', default: true, show: 'column' });
    expect(editAction(() => {}, { label: 'Umbenennen' })).toMatchObject({ key: 'edit', label: 'Umbenennen' });
    expect(deleteAction(() => {})).toMatchObject({ key: 'delete', label: 'Löschen', variant: 'danger' });
  });
});

describe('useSavedTableFilters', () => {
  it('gives the saved filters of a table from the provider\'s store', async () => {
    const { result } = renderHook(() => useSavedTableFilters('users'), { wrapper: wrapper('en') });

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.items[0]).toMatchObject({ name: 'Theirs', removable: false });
  });
});
