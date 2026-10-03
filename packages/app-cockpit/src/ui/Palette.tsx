import { Dialog } from '@base-ui/react/dialog';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, ReactElement } from 'react';
import type { MiniApp } from '../api';
import { groupsOf, search } from '../core/search';
import type { Match } from '../core/search';
import type { Texts } from '../core/texts';
import { AppIcon } from './AppIcon';
import { SearchIcon } from './icons';

export { Palette };

type Section = { label: string; matches: readonly Match[] };

// The search for apps (a command palette): a field, the matching apps below it. Without a query: the recent apps,
// then all apps by group. Up and Down choose, Enter opens, Escape closes.
function Palette({ open, onOpenChange, apps, recent, active, texts, portal, onOpen }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apps: readonly MiniApp[];
  recent: readonly MiniApp[];
  active: MiniApp | undefined;
  texts: Texts;
  portal: HTMLElement;
  onOpen: (id: string) => void;
}): ReactElement {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const id = useId();

  const sections = useMemo((): Section[] => {
    if (query.trim() !== '') {
      return [{ label: '', matches: search(apps, query) }];
    }

    return [
      ...(recent.length > 0 ? [{ label: texts.recent, matches: recent.map((app) => ({ app })) }] : []),
      ...groupsOf(apps).map((group) => ({
        label: group.name === '' ? texts.other : group.name,
        matches: group.apps.map((app) => ({ app })),
      })),
    ];
  }, [apps, recent, query, texts]);

  const flat = sections.flatMap((section) => section.matches);
  const current = flat[Math.min(index, flat.length - 1)];

  // A new search starts at the best match; an opened palette at the open app (or the first).
  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setIndex(Math.max(0, recent.findIndex((app) => app.id === active?.id)));
    }
  }, [open]);

  useEffect(() => {
    list.current?.querySelector('[data-current]')?.scrollIntoView({ block: 'nearest' });
  }, [current]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const step = { ArrowDown: 1, ArrowUp: -1, PageDown: 8, PageUp: -8 }[event.key];

    if (step !== undefined && flat.length > 0) {
      event.preventDefault();
      setIndex((value) => Math.max(0, Math.min(flat.length - 1, value + step)));
    } else if (event.key === 'Enter' && current !== undefined) {
      event.preventDefault();
      onOpen(current.app.id);
    }
  };

  let position = -1;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={portal}>
        <Dialog.Backdrop className="backdrop" />
        <Dialog.Popup className="palette" initialFocus={input}>
          <Dialog.Title className="visually-hidden">{texts.search}</Dialog.Title>
          <div className="palette-field">
            <SearchIcon />
            <input
              ref={input}
              className="palette-input"
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={`${id}-list`}
              aria-activedescendant={current === undefined ? undefined : `${id}-${current.app.id}`}
              aria-autocomplete="list"
              autoComplete="off"
              spellCheck={false}
              placeholder={texts.searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
            />
            <kbd className="key">Esc</kbd>
          </div>
          <div ref={list} id={`${id}-list`} className="palette-list" role="listbox" aria-label={texts.search}>
            {flat.length === 0 && <p className="palette-empty">{texts.noResults}</p>}
            {sections.map((section) =>
              section.matches.length === 0
                ? null
                : (
                  <div key={section.label} role="group" aria-label={section.label || undefined}>
                    {section.label !== '' && <div className="palette-section">{section.label}</div>}
                    {section.matches.map((match) => {
                      position += 1;

                      const at = position;
                      const isCurrent = match === current;

                      return (
                        <div
                          key={`${section.label}-${match.app.id}`}
                          id={isCurrent ? `${id}-${match.app.id}` : undefined}
                          className="palette-option"
                          role="option"
                          aria-selected={isCurrent}
                          data-current={isCurrent || undefined}
                          onMouseMove={() => setIndex(at)}
                          onClick={() => onOpen(match.app.id)}
                        >
                          <AppIcon app={match.app} />
                          <span className="palette-text">
                            <span className="palette-title">
                              <Highlighted text={match.app.title} range={match.title} />
                            </span>
                            {match.app.description !== undefined && (
                              <span className="palette-description">{match.app.description}</span>
                            )}
                          </span>
                          {match.app.group !== undefined && section.label === '' && (
                            <span className="palette-group">
                              {match.app.subgroup === undefined
                                ? match.app.group
                                : `${match.app.group} › ${match.app.subgroup}`}
                            </span>
                          )}
                          {match.app.id === active?.id && <span className="palette-dot" aria-hidden="true" />}
                        </div>
                      );
                    })}
                  </div>
                )
            )}
          </div>
          <footer className="palette-footer">
            <span>
              <kbd className="key">↑</kbd>
              <kbd className="key">↓</kbd> {texts.move}
            </span>
            <span>
              <kbd className="key">↵</kbd> {texts.open}
            </span>
            <span>
              <kbd className="key">Esc</kbd> {texts.close}
            </span>
            <span className="palette-count">{texts.apps(query.trim() === '' ? apps.length : flat.length)}</span>
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Highlighted({ text, range }: { text: string; range: Match['title'] }): ReactElement {
  if (range === undefined) {
    return <>{text}</>;
  }

  return (
    <>
      {text.slice(0, range.start)}
      <mark>{text.slice(range.start, range.end)}</mark>
      {text.slice(range.end)}
    </>
  );
}
