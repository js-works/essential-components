import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import type * as Spec from '../api';
import { readStored, writeStored } from '../core/storage';
import { textsFor } from '../core/texts';
import { Frame } from '../ui/Frame';
import type { Status } from '../ui/Frame';
import { STYLES } from '../ui/styles';

export { AppCockpitElement };

// How many apps the "Recent" list keeps.
const RECENT = 5;

// The cockpit: its own UI (React) in its shadow root, the mini-apps as its light-DOM children, shown through the
// default slot (their CSS is often global, which would not reach into a shadow root).
//
// - The first segment of the URL hash is the id of the open app (`#board-manager/…`; the rest belongs to the app). No
//   hash, or an unknown first segment at the start: the first app. Opening an app pushes a history entry, so Back and
//   Forward go through the apps.
// - An app is created when it is opened the first time (after its `load()`), and then kept: the others get `hidden`,
//   so each keeps its state. Its element gets `data-hash-segment` (its id), so tabs inside it know their level.
class AppCockpitElement extends HTMLElement implements Spec.Element {
  readonly #config: Spec.Config;
  readonly #mount: HTMLDivElement;
  readonly #elements = new Map<string, HTMLElement>();
  readonly #status = new Map<string, Status>();
  readonly #recentKey: string;
  #recent: string[];
  #active: string | undefined;
  #root: Root | undefined;
  #langObserver: MutationObserver | undefined;

  constructor(config: Spec.Config) {
    super();
    this.#config = config;
    this.#recentKey = `${config.storageKey ?? 'app-cockpit'}:recent`;
    this.#recent = readStored<string[]>(this.#recentKey, []);

    const shadow = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');

    style.textContent = STYLES;
    this.#mount = document.createElement('div');
    this.#mount.className = 'mount';
    shadow.append(style, this.#mount);
  }

  get activeApp(): Spec.MiniApp | undefined {
    return this.#app(this.#active);
  }

  // Opens an app (from the navigation, the search, or the host's code).
  open(id: string): void {
    if (this.#app(id) === undefined) {
      return;
    }

    if (this.#segment() !== id) {
      history.pushState(null, '', `${location.pathname}${location.search}#${id}`);
    }

    this.#show(id);
  }

  connectedCallback(): void {
    this.#root ??= createRoot(this.#mount);
    this.#langObserver = new MutationObserver(() => this.#render());
    this.#langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    window.addEventListener('hashchange', this.#onHashChange);

    const segment = this.#segment();

    this.#show(this.#app(segment)?.id ?? this.#config.apps[0]?.id);
  }

  disconnectedCallback(): void {
    window.removeEventListener('hashchange', this.#onHashChange);
    this.#langObserver?.disconnect();
    // Unmounted a bit later, and only if the element stays out of the document: a move (disconnected and connected
    // again at once) keeps its UI. React must not unmount synchronously while it may be rendering, either.
    queueMicrotask(() => {
      if (!this.isConnected) {
        this.#root?.unmount();
        this.#root = undefined;
      }
    });
  }

  // Back, Forward, or a link: an unknown first segment (e.g. an anchor of the host page) is left alone.
  readonly #onHashChange = () => {
    const app = this.#app(this.#segment());

    if (app !== undefined) {
      this.#show(app.id);
    } else if (location.hash === '') {
      this.#show(this.#config.apps[0]?.id);
    }
  };

  #segment(): string {
    return decodeURIComponent(location.hash.slice(1).split('/')[0] ?? '');
  }

  #app(id: string | undefined): Spec.MiniApp | undefined {
    return id === undefined ? undefined : this.#config.apps.find((app) => app.id === id);
  }

  #show(id: string | undefined): void {
    const app = this.#app(id);

    if (app === undefined) {
      this.#render();
      return;
    }

    this.#active = app.id;
    this.#recent = [app.id, ...this.#recent.filter((other) => other !== app.id)].slice(0, RECENT);
    writeStored(this.#recentKey, this.#recent);

    for (const [other, element] of this.#elements) {
      element.hidden = other !== app.id;
    }

    if (!this.#elements.has(app.id)) {
      void this.#create(app);
    }

    this.#render();
  }

  async #create(app: Spec.MiniApp): Promise<void> {
    if (this.#status.get(app.id) === 'loading') {
      return;
    }

    this.#status.set(app.id, 'loading');
    this.#render();

    try {
      await app.load?.();

      const element = document.createElement(app.element);

      for (const [name, value] of Object.entries(app.attributes ?? {})) {
        element.setAttribute(name, value);
      }

      element.setAttribute('data-hash-segment', app.id);
      element.hidden = this.#active !== app.id;
      this.#elements.set(app.id, element);
      this.append(element);
      this.#status.set(app.id, 'ready');
    } catch (error) {
      console.error(`app-cockpit: the app "${app.id}" could not be loaded.`, error);
      this.#status.set(app.id, 'failed');
    }

    this.#render();
  }

  #render(): void {
    const active = this.#app(this.#active);

    this.#root?.render(createElement(Frame, {
      title: this.#config.title ?? 'Apps',
      subtitle: this.#config.subtitle,
      search: this.#config.search,
      apps: this.#config.apps,
      groupDisplay: this.#config.groupDisplay ?? 'sections',
      footer: this.#config.footer ?? {},
      user: this.#config.user,
      userMenu: this.#config.userMenu ?? [],
      groupIcons: Object.fromEntries(
        (this.#config.groups ?? []).flatMap((group) => (group.icon === undefined ? [] : [[group.name, group.icon]])),
      ),
      // By `group/subgroup`.
      subgroupIcons: Object.fromEntries(
        (this.#config.groups ?? []).flatMap((group) =>
          (group.subgroups ?? []).flatMap((subgroup) =>
            subgroup.icon === undefined ? [] : [[`${group.name}/${subgroup.name}`, subgroup.icon]]
          )
        ),
      ),
      active,
      status: active === undefined ? 'ready' : this.#status.get(active.id) ?? 'loading',
      recent: this.#recent.flatMap((id) => this.#app(id) ?? []),
      texts: textsFor(document.documentElement.lang),
      storageKey: this.#config.storageKey ?? 'app-cockpit',
      portal: this.#mount,
      onOpen: (id: string) => this.open(id),
      onRetry: () => {
        if (active !== undefined) {
          this.#status.delete(active.id);
          void this.#create(active);
        }
      },
    }));
  }
}
