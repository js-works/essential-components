import { Collapsible } from '@base-ui/react/collapsible';
import { Menu } from '@base-ui/react/menu';
import { Tooltip } from '@base-ui/react/tooltip';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent, ReactElement, ReactNode, RefObject } from 'react';
import type { Footer as CockpitFooter, MenuItem, MiniApp, User } from '../api';
import { groupsOf, subgroupsOf } from '../core/search';
import type { Group } from '../core/search';
import { readStored, writeStored } from '../core/storage';
import type { Texts } from '../core/texts';
import { AppIcon, GroupIcon, initialsOf } from './AppIcon';
import { Footer } from './Footer';
import { GroupSelect } from './GroupSelect';
import { ChevronIcon, SearchIcon } from './icons';
import { Palette } from './Palette';
import { UserRow } from './UserRow';
import { WithTooltip } from './WithTooltip';

export { Frame };
export type { FrameProps, Status };

type Status = 'loading' | 'ready' | 'failed';

type FrameProps = {
  title: string;
  subtitle: string | undefined;
  search: boolean | undefined;
  apps: readonly MiniApp[];
  groupDisplay: 'sections' | 'select';
  // The icons of the groups, by name.
  groupIcons: Readonly<Record<string, string>>;
  // The icons of the subgroups, by `group/subgroup`.
  subgroupIcons: Readonly<Record<string, string>>;
  active: MiniApp | undefined;
  status: Status;
  recent: readonly MiniApp[];
  texts: Texts;
  storageKey: string;
  footer: CockpitFooter;
  user: User | undefined;
  userMenu: readonly (readonly MenuItem[])[];
  // Where the popups go (inside the shadow root, so they get its styles).
  portal: HTMLElement;
  onOpen: (id: string) => void;
  onRetry: () => void;
};

// The sidebar adapts to the number of apps:
// - Few (up to `FEW`): every app is listed, the groups are plain headings, no search, no "Recent".
// - More: a search (also Ctrl+K / ⌘K), the recent apps on top, and the groups collapsible (closed by default once
//   there are more than `MANY`, except the group of the open app).
const FEW = 12;
const MANY = 30;

// Narrower than this (the cockpit's own width), the sidebar is always a rail of icons.
const NARROW = 768;

function Frame(props: FrameProps): ReactElement {
  const {
    title,
    subtitle,
    search,
    apps,
    active,
    status,
    recent,
    texts,
    storageKey,
    portal,
    footer,
    user,
    userMenu,
    onOpen,
    onRetry,
  } = props;
  const frame = useRef<HTMLDivElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const [collapsed, setCollapsed] = useState(() => readStored(`${storageKey}:collapsed`, false));
  // The sidebar's width in px, set by dragging its edge (remembered per browser); `undefined`: the CSS default.
  const [width, setWidth] = useState<number | undefined>(() => readStored(`${storageKey}:width`, undefined));
  const [resizing, setResizing] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  // The rail: collapsed by the user, too narrow, or while the search is open (it takes the sidebar's place; the user's
  // choice is kept for after it).
  const rail = collapsed || narrow || paletteOpen;
  const many = apps.length > FEW;
  // The search: with many apps, or when the host asks for it (`search: true`; `false`: never).
  const searchable = search ?? many;

  useLayoutEffect(() => {
    const element = frame.current;

    if (element === null) {
      return;
    }

    const observer = new ResizeObserver(() => setNarrow(element.offsetWidth < NARROW));

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // Ctrl+K (⌘K on a Mac) opens the search, wherever the focus is.
  useEffect(() => {
    if (!searchable) {
      return;
    }

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [searchable]);

  // The search (with many apps): an icon button with a tooltip ("Search apps (Ctrl K)"); next to the title, or below
  // the logo in the rail.
  const searchLabel = `${texts.search} (${isMac() ? '⌘K' : 'Ctrl K'})`;
  const searchButton = (
    <WithTooltip label={searchLabel} side={rail ? 'right' : 'bottom'} portal={portal}>
      <button type="button" className="search-button" aria-label={texts.search} onClick={() => setPaletteOpen(true)}>
        <SearchIcon />
      </button>
    </WithTooltip>
  );

  const toggle = () => {
    setCollapsed((value) => {
      writeStored(`${storageKey}:collapsed`, !value);
      return !value;
    });
  };

  return (
    <Tooltip.Provider delay={300}>
      <div
        ref={frame}
        className="frame"
        data-rail={rail || undefined}
        data-resizing={resizing || undefined}
        style={width === undefined ? undefined : ({ '--app-cockpit-sidebar-width': `${width}px` } as CSSProperties)}
      >
        <aside ref={sidebar} className="sidebar">
          {!rail && (
            <ResizeHandle
              label={texts.resize}
              width={width}
              onResize={(next) => setWidth(next)}
              onResizing={setResizing}
              onDone={(next) => writeStored(`${storageKey}:width`, next)}
            />
          )}
          <div className="brand">
            <slot name="logo">
              <span className="brand-logo" aria-hidden="true">
                <GridIcon />
              </span>
            </slot>
            <span className="brand-text">
              <span className="brand-title">{title}</span>
              {subtitle !== undefined && <span className="brand-subtitle">{subtitle}</span>}
            </span>
            {searchable && !rail && searchButton}
          </div>
          {searchable && rail && searchButton}
          <Navigation {...props} rail={rail} many={many} sidebar={sidebar} />
          <div className="sidebar-end">
            <slot name="sidebar-end" />
          </div>
          {user !== undefined && <UserRow user={user} menu={userMenu} rail={rail} texts={texts} portal={portal} />}
          <Footer
            footer={footer}
            rail={rail}
            canToggle={!narrow}
            texts={texts}
            portal={portal}
            onToggle={toggle}
          />
        </aside>
        <main className="main">
          <slot />
          {status === 'loading' && (
            <div className="state" role="status">
              <span className="spinner" aria-hidden="true" />
              {texts.loading}
            </div>
          )}
          {status === 'failed' && (
            <div className="state" role="alert">
              <p>{texts.loadFailed}</p>
              <button type="button" className="retry-button" onClick={onRetry}>{texts.retry}</button>
            </div>
          )}
        </main>
      </div>
      {searchable && (
        <Palette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          apps={apps}
          recent={recent}
          active={active}
          texts={texts}
          portal={portal}
          onOpen={(id) => {
            setPaletteOpen(false);
            onOpen(id);
          }}
        />
      )}
    </Tooltip.Provider>
  );
}

function Navigation(
  {
    apps,
    groupDisplay,
    groupIcons,
    subgroupIcons,
    active,
    recent,
    texts,
    storageKey,
    portal,
    onOpen,
    rail,
    many,
    sidebar,
  }:
    & FrameProps
    & {
      rail: boolean;
      many: boolean;
      // The sidebar: the rail's flyouts open next to it.
      sidebar: RefObject<HTMLElement | null>;
    },
): ReactElement {
  const groups = groupsOf(apps);
  const labelOf = (group: Group) => (group.name === '' ? texts.other : group.name);
  // The group of the select (`groupDisplay: 'select'`): the open app's, and the user may look into another one.
  const [selected, setSelected] = useState(() => active?.group ?? groups[0]?.name ?? '');

  useEffect(() => {
    if (active !== undefined) {
      setSelected(active.group ?? '');
    }
  }, [active?.id]);

  const openKey = `${storageKey}:groups`;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => readStored(openKey, {}));
  const isOpen = (name: string) =>
    openGroups[name] ?? (apps.length <= MANY || name === (active?.group ?? '') || name === '');

  const setOpen = (name: string, open: boolean) => {
    setOpenGroups((value) => {
      const next = { ...value, [name]: open };

      writeStored(openKey, next);
      return next;
    });
  };

  const item = (app: MiniApp, key = app.id) => (
    <NavItem key={key} app={app} active={app.id === active?.id} rail={rail} portal={portal} onOpen={onOpen} />
  );

  // The apps of a group as a tree: the apps without a subgroup, then each subgroup (collapsible, open by default) with
  // its apps. In the rail: flat.
  const tree = (group: Group) => {
    const { loose, subgroups } = subgroupsOf(group.apps);

    // In the rail: the apps without a subgroup as icons, each subgroup as one button (its icon, else its initials) with
    // a flyout of its apps.
    if (rail) {
      return [
        ...loose.map((app) => <li key={app.id}>{item(app)}</li>),
        ...subgroups.map((subgroup) => (
          <li key={`${group.name}/${subgroup.name}`}>
            <GroupFlyout
              group={{ name: subgroup.name, apps: subgroup.apps.map(({ subgroup: _subgroup, ...app }) => app) }}
              label={subgroup.name}
              icon={subgroupIcons[`${group.name}/${subgroup.name}`]}
              active={active}
              portal={portal}
              sidebar={sidebar}
              onOpen={onOpen}
            />
          </li>
        )),
      ];
    }

    return [
      ...loose.map((app) => <li key={app.id}>{item(app)}</li>),
      ...subgroups.map((subgroup) => {
        const key = `${group.name}/${subgroup.name}`;

        return (
          <li key={key}>
            <Collapsible.Root
              className="subgroup"
              open={openGroups[key] ?? true}
              onOpenChange={(open) => setOpen(key, open)}
            >
              <Collapsible.Trigger className="subgroup-trigger">
                <ChevronIcon />
                {subgroupIcons[key] !== undefined && <GroupIcon icon={subgroupIcons[key]} />}
                <span className="subgroup-name">{subgroup.name}</span>
                <span className="subgroup-count">{subgroup.apps.length}</span>
              </Collapsible.Trigger>
              <Collapsible.Panel className="group-panel">
                <ul className="list subgroup-list">
                  {subgroup.apps.map((app) => <li key={app.id}>{item(app)}</li>)}
                </ul>
              </Collapsible.Panel>
            </Collapsible.Root>
          </li>
        );
      }),
    ];
  };

  // Up and Down move between the buttons of the navigation, Home and End to the first and the last.
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button')].filter((button) =>
      button.offsetParent !== null
    );
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    const next = ({
      ArrowDown: buttons[index + 1],
      ArrowUp: buttons[index - 1],
      Home: buttons[0],
      End: buttons.at(-1),
    } as Record<string, HTMLButtonElement | undefined>)[event.key];

    if (index >= 0 && next !== undefined) {
      event.preventDefault();
      next.focus();
    }
  };

  // The rail of many apps. With groups: one button per group (its icon, else its initials; the open app's group
  // marked), each with a flyout of its apps (by subgroup). Without groups: the recent apps and the open one (the search
  // finds the rest).
  if (rail && many) {
    if (groups.length > 1) {
      return (
        <nav className="nav" aria-label={texts.navigation} onKeyDown={onKeyDown}>
          <ul className="list">
            {groups.map((group) => (
              <li key={group.name}>
                <GroupFlyout
                  group={group}
                  label={labelOf(group)}
                  icon={groupIcons[group.name]}
                  active={active}
                  portal={portal}
                  sidebar={sidebar}
                  onOpen={onOpen}
                />
              </li>
            ))}
          </ul>
        </nav>
      );
    }

    const shown = [...recent];

    if (active !== undefined && !shown.some((app) => app.id === active.id)) {
      shown.unshift(active);
    }

    return (
      <nav className="nav" aria-label={texts.navigation} onKeyDown={onKeyDown}>
        <ul className="list">{shown.map((app) => <li key={app.id}>{item(app)}</li>)}</ul>
      </nav>
    );
  }

  // One group at a time: the select on top, the apps of the chosen group below it.
  if (groupDisplay === 'select' && !rail && groups.length > 1) {
    const group = groups.find((candidate) => candidate.name === selected) ?? groups[0];

    return (
      <>
        <GroupSelect
          groups={groups}
          value={group?.name ?? ''}
          labelOf={labelOf}
          iconOf={(group) => groupIcons[group.name]}
          label={texts.group}
          portal={portal}
          onChange={setSelected}
        />
        <nav className="nav" aria-label={texts.navigation} onKeyDown={onKeyDown}>
          {group !== undefined && <ul className="list">{tree(group)}</ul>}
        </nav>
      </>
    );
  }

  return (
    <nav className="nav" aria-label={texts.navigation} onKeyDown={onKeyDown}>
      {many && recent.length > 0 && (
        <Section label={texts.recent}>
          {recent.map((app) => <li key={app.id}>{item(app, `recent-${app.id}`)}</li>)}
        </Section>
      )}
      {groups.map((group) => {
        const label = group.name === '' ? (groups.length > 1 && many ? texts.other : '') : group.name;
        const list = tree(group);

        if (rail || !many || label === '') {
          return <Section key={group.name} label={rail ? '' : label}>{list}</Section>;
        }

        return (
          <Collapsible.Root
            key={group.name}
            className="group"
            open={isOpen(group.name)}
            onOpenChange={(open) => setOpen(group.name, open)}
          >
            <Collapsible.Trigger className="group-trigger">
              <ChevronIcon />
              {groupIcons[group.name] !== undefined && <GroupIcon icon={groupIcons[group.name]} />}
              <span className="group-name">{label}</span>
              <span className="group-count">{group.apps.length}</span>
            </Collapsible.Trigger>
            <Collapsible.Panel className="group-panel">
              <ul className="list">{list}</ul>
            </Collapsible.Panel>
          </Collapsible.Root>
        );
      })}
    </nav>
  );
}

// A group (or a subgroup) in the rail: its button (with its name as the tooltip), and a panel with its apps: the apps without a
// subgroup first, then each subgroup with its name as a heading. The panel starts at its button, touches the sidebar
// (square corners, a line between them) and is only as high as it needs to be (it scrolls when it does not fit). The open app is marked; choosing an app
// opens it.
function GroupFlyout({ group, label, icon, active, portal, sidebar, onOpen }: {
  group: Group;
  label: string;
  icon: string | undefined;
  active: MiniApp | undefined;
  portal: HTMLElement;
  sidebar: RefObject<HTMLElement | null>;
  onOpen: (id: string) => void;
}): ReactElement {
  const { loose, subgroups } = subgroupsOf(group.apps);
  const current = group.apps.some((app) => app.id === active?.id);
  const trigger = useRef<HTMLButtonElement>(null);
  const entry = (app: MiniApp) => (
    <Menu.Item
      key={app.id}
      className="flyout-item"
      data-current={app.id === active?.id || undefined}
      onClick={() => onOpen(app.id)}
    >
      {app.title}
    </Menu.Item>
  );

  return (
    <Menu.Root>
      <WithTooltip label={label} portal={portal}>
        <Menu.Trigger
          ref={trigger}
          className="item"
          aria-label={label}
          aria-current={current ? 'true' : undefined}
        >
          {icon === undefined
            ? <span className="tile" aria-hidden="true">{initialsOf(label)}</span>
            : <GroupIcon icon={icon} />}
        </Menu.Trigger>
      </WithTooltip>
      <Menu.Portal container={portal}>
        <Menu.Positioner
          className="menu-positioner"
          side="right"
          align="start"
          // From the button's right edge to the sidebar's: the panel touches the sidebar.
          sideOffset={() =>
            (sidebar.current?.getBoundingClientRect().right ?? 0)
            - (trigger.current?.getBoundingClientRect().right ?? 0)}
          collisionPadding={0}
        >
          <Menu.Popup className="flyout">
            <div className="flyout-title">{label}</div>
            {loose.map(entry)}
            {subgroups.map((subgroup) => (
              <Menu.Group key={subgroup.name}>
                <Menu.GroupLabel className="flyout-label">{subgroup.name}</Menu.GroupLabel>
                {subgroup.apps.map(entry)}
              </Menu.Group>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }): ReactElement {
  return (
    <section className="section">
      {label === '' ? <hr className="section-rule" /> : <h2 className="section-label">{label}</h2>}
      <ul className="list">{children}</ul>
    </section>
  );
}

function NavItem({ app, active, rail, portal, onOpen }: {
  app: MiniApp;
  active: boolean;
  rail: boolean;
  portal: HTMLElement;
  onOpen: (id: string) => void;
}): ReactElement {
  return (
    <WithTooltip label={app.title} enabled={rail} portal={portal}>
      <button
        type="button"
        className="item"
        aria-current={active ? 'page' : undefined}
        aria-label={rail ? app.title : undefined}
        title={rail ? undefined : app.description}
        onClick={() => onOpen(app.id)}
      >
        <AppIcon app={app} initials={rail} />
        <span className="item-title">{app.title}</span>
      </button>
    </WithTooltip>
  );
}

// The sidebar's width: between these, in px.
const MIN_WIDTH = 200;
const MAX_WIDTH = 420;

const clamp = (value: number) => Math.round(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, value)));

// The handle on the sidebar's right edge: drag it to resize the sidebar; Left and Right (Shift: more) do it from the
// keyboard; a double click goes back to the default width (`undefined`).
function ResizeHandle({ label, width, onResize, onResizing, onDone }: {
  label: string;
  width: number | undefined;
  onResize: (width: number | undefined) => void;
  onResizing: (resizing: boolean) => void;
  onDone: (width: number | undefined) => void;
}): ReactElement {
  const current = (element: HTMLElement) => element.parentElement?.getBoundingClientRect().width ?? MIN_WIDTH;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();

    const handle = event.currentTarget;
    const startX = event.clientX;
    const startWidth = current(handle);
    let last = startWidth;

    handle.setPointerCapture(event.pointerId);
    onResizing(true);

    const move = (moveEvent: globalThis.PointerEvent) => {
      last = clamp(startWidth + moveEvent.clientX - startX);
      onResize(last);
    };
    const up = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
      onResizing(false);
      onDone(last);
    };

    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 48 : 16;
    const delta = { ArrowLeft: -step, ArrowRight: step }[event.key];

    if (delta !== undefined) {
      event.preventDefault();

      const next = clamp(current(event.currentTarget) + delta);

      onResize(next);
      onDone(next);
    }
  };

  return (
    <div
      className="resize-handle"
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuemin={MIN_WIDTH}
      aria-valuemax={MAX_WIDTH}
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onDoubleClick={() => {
        onResize(undefined);
        onDone(undefined);
      }}
    />
  );
}

function GridIcon(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" opacity="0.6" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" opacity="0.6" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
    </svg>
  );
}

function isMac(): boolean {
  return /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
}
