import type { AppHeaderCrumb, AppHeaderElement, AppHeaderLink, AppHeaderNavigateDetail } from '../main/index.js';

export type { AppHeaderDemoOptions };
export { wireAppHeader };

type AppHeaderDemoOptions = {
  modules: readonly AppHeaderLink[];
  // The records of a module (by its path: `/projects`), by key: their pages are `<module>/<key>`.
  records: Readonly<Record<string, Readonly<Record<string, string>>>>;
  // The title's switcher: choosing an entry changes the title and the icon.
  switcher?: readonly AppHeaderLink[];
  // Each event of the header, as a line (the demos' log).
  onEvent?: (line: string) => void;
};

// A router of the demos: its own list of paths and the index of the current one (no URL).
class MadeUpRouter {
  #paths: string[] = [];
  #index = -1;
  readonly #onChange: (path: string) => void;

  constructor(onChange: (path: string) => void) {
    this.#onChange = onChange;
  }

  get back(): string | undefined {
    return this.#paths[this.#index - 1];
  }

  get forward(): string | undefined {
    return this.#paths[this.#index + 1];
  }

  push(path: string): void {
    this.#paths = [...this.#paths.slice(0, this.#index + 1), path];
    this.#index++;
    this.#onChange(path);
  }

  go(delta: number): void {
    const index = this.#index + delta;

    if (index >= 0 && index < this.#paths.length) {
      this.#index = index;
      this.#onChange(this.#paths[index]!);
    }
  }
}

// An app header and the page below it, answered by a made-up router: the header's events move the router, the router
// sets the header's state (the active module, the crumbs, Back and Forward) and the page (a module's records as links,
// a record's page); it starts on the start page (`/`).
function wireAppHeader(header: AppHeaderElement, page: HTMLElement, options: AppHeaderDemoOptions): void {
  const { modules, records, switcher = [], onEvent = () => {} } = options;
  const moduleOf = (path: string) =>
    modules.find((link) => link.id !== '/' && (path === link.id || path.startsWith(`${link.id}/`)));
  const recordOf = (path: string) => {
    const module = moduleOf(path);

    return module === undefined ? undefined : records[module.id]?.[path.slice(module.id.length + 1)];
  };
  const pageOf = (path: string) => recordOf(path) ?? moduleOf(path)?.label ?? 'Home';

  const show = (path: string) => {
    const module = moduleOf(path);
    const record = recordOf(path);
    const crumbs: AppHeaderCrumb[] = [
      ...(module === undefined ? [] : [{ label: module.label, href: module.href }]),
      ...(record === undefined ? [] : [{ label: record }]),
    ];
    const list = module === undefined || record !== undefined ? undefined : records[module.id];

    header.activeModule = module?.id ?? (path === '/' ? '/' : '');
    header.crumbs = crumbs;
    header.back = router.back === undefined ? null : { page: pageOf(router.back) };
    header.forward = router.forward === undefined ? null : { page: pageOf(router.forward) };
    page.innerHTML = list === undefined
      ? `<p>The page <code>${path}</code>.</p>`
      : `<p>${module!.label}: ${
        Object.entries(list).map(([key, name]) => `<a href="${module!.id}/${key}">${name}</a>`).join(', ')
      }</p>`;
  };
  const router = new MadeUpRouter(show);

  header.addEventListener('navigate', (event) => {
    const { href } = (event as CustomEvent<AppHeaderNavigateDetail>).detail;
    // The header's current entries (a demo may switch them).
    const entry = header.switcher.find((link) => link.href === href);

    event.preventDefault();
    onEvent(`navigate ${href}`);

    if (entry !== undefined) {
      header.activeSwitcherItem = entry.id;
      header.heading = entry.label;
      header.icon = entry.icon ?? header.icon;
      return;
    }

    router.push(href);
  });
  header.addEventListener('back', (event) => {
    event.preventDefault();
    onEvent('back');
    router.go(-1);
  });
  header.addEventListener('forward', (event) => {
    event.preventDefault();
    onEvent('forward');
    router.go(1);
  });
  page.addEventListener('click', (event) => {
    const link = (event.target as Element).closest('a');

    if (link !== null) {
      event.preventDefault();
      router.push(link.getAttribute('href') ?? '/');
    }
  });
  header.homeHref = '/';
  header.modules = modules;
  header.switcher = switcher;
  router.push('/');
}
