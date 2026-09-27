import { Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import type { DataNavigator } from '../api';
import { ConfigContext, resolveConfig } from '../core/config';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from '../core/useDataNavigator';
import { contentRendererOf, nodeContent } from './content';
import { bindController, controllerFactoryOf, releaseController, renderController } from './controller';
import type { ElementSettings } from './controller';
import { HOST_ATTRIBUTE, provideStyles } from './styles';

export { setupDataNavigator };

const DENSITIES: readonly DataNavigator.Density[] = ['compact', 'normal', 'comfortable'];

// The events that stop at the element's border (see the constructor).
const CONTAINED_EVENTS = ['input', 'keypress', 'keydown'] as const;

// The properties an app (or a framework) may set before the element is defined: taken over when it is upgraded.
const UPGRADED_PROPERTIES = [
  'controller',
  'density',
  'striped',
  'searchable',
  'reloadable',
  'selectionAppearance',
  'pageSize',
  'pageSizeOptions',
] as const;

// Called once per app, with the app's theme, i18n adapter and content adapter. Returns an element class (not
// registered: the app registers it under a tag name of its choice) and the factory of its controllers, both bound to
// this configuration. The element wraps the React view, rendered into its light DOM.
function setupDataNavigator<C = Node>(
  config: DataNavigator.SetupConfig<C> = {},
): readonly [DataNavigator.ElementClass<C>, DataNavigator.CreateNavigatorController<C>] {
  const resolved = resolveConfig({ theme: config.theme, i18n: config.i18n });
  // Without an adapter, `C` is `Node` (the default of the type parameter), and the default adapter renders nodes.
  const content = contentRendererOf((config.content ?? nodeContent) as DataNavigator.ContentAdapter<unknown>);
  // The identity of this setup: its controllers are only accepted by its element class.
  const setup = {};

  class DataNavigatorElement extends HTMLElement {
    static observedAttributes = ['density', 'striped', 'searchable', 'reloadable', 'selection-appearance', 'page-size'];

    #controller: DataNavigator.NavigatorController<unknown, C> | undefined;
    #pageSizeOptions: readonly number[] | undefined;
    #root: Root | undefined;
    #stopListening: (() => void) | undefined;

    // Typing into the element (search, filters, the page number) and its keyboard handling stay inside it: the page gets
    // none of these events. Global keyboard shortcuts of the page (e.g. those of XWiki, on the document) would react to
    // them otherwise: from inside a shadow root, the event arrives at the document with the host as its target, not the
    // input, so the page cannot tell that someone is typing. Our own handlers are inside the element (React listens on
    // it), so they are not affected.
    constructor() {
      super();

      // Except Escape: Base UI closes its popups (selects, menus, the date popover) on it through a listener on the
      // document.
      for (const type of CONTAINED_EVENTS) {
        this.addEventListener(type, (event) => {
          if (!(event instanceof KeyboardEvent && event.key === 'Escape')) {
            event.stopPropagation();
          }
        });
      }
    }

    get controller(): DataNavigator.NavigatorController<unknown, C> | undefined {
      return this.#controller;
    }

    set controller(controller: DataNavigator.NavigatorController<unknown, C> | undefined) {
      if (controller === this.#controller) {
        return;
      }

      if (controller !== undefined) {
        bindController(controller, this, setup);
      }

      if (this.#controller !== undefined) {
        releaseController(this.#controller, this);
      }

      this.#controller = controller;
      this.#render();
    }

    get density(): DataNavigator.Density {
      const value = this.getAttribute('density');

      return DENSITIES.find((density) => density === value) ?? 'normal';
    }

    set density(density: DataNavigator.Density) {
      this.setAttribute('density', density);
    }

    get striped(): boolean {
      return this.hasAttribute('striped');
    }

    set striped(striped: boolean) {
      this.toggleAttribute('striped', striped);
    }

    get searchable(): boolean {
      return this.hasAttribute('searchable');
    }

    set searchable(searchable: boolean) {
      this.toggleAttribute('searchable', searchable);
    }

    get reloadable(): boolean {
      return this.hasAttribute('reloadable');
    }

    set reloadable(reloadable: boolean) {
      this.toggleAttribute('reloadable', reloadable);
    }

    get selectionAppearance(): DataNavigator.SelectionAppearance {
      return this.getAttribute('selection-appearance') === 'accent' ? 'accent' : 'neutral';
    }

    set selectionAppearance(appearance: DataNavigator.SelectionAppearance) {
      this.setAttribute('selection-appearance', appearance);
    }

    // The page size the table starts with (a positive integer; anything else means the default).
    get pageSize(): number {
      const value = Number(this.getAttribute('page-size'));

      return Number.isInteger(value) && value > 0 ? value : DEFAULT_PAGE_SIZE;
    }

    set pageSize(pageSize: number) {
      this.setAttribute('page-size', String(pageSize));
    }

    get pageSizeOptions(): readonly number[] {
      return this.#pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;
    }

    set pageSizeOptions(options: readonly number[]) {
      this.#pageSizeOptions = options;
      this.#render();
    }

    connectedCallback(): void {
      this.#upgradeProperties();
      this.setAttribute(HOST_ATTRIBUTE, '');
      provideStyles(this);

      // Moved within one task (removed and added again): the root is still there.
      if (this.#root === undefined) {
        this.#root = createRoot(this);
        // The React view renders its own texts again on a change of the language; the content functions of the
        // controller's options are called again by rendering everything.
        this.#stopListening = resolved.i18n?.onChange?.(() => this.#render());
      }

      this.#render();
    }

    disconnectedCallback(): void {
      // Unmounted only when it stays removed: a move (removed and added again in the same task) keeps the table.
      queueMicrotask(() => {
        if (!this.isConnected) {
          this.#stopListening?.();
          this.#stopListening = undefined;
          this.#root?.unmount();
          this.#root = undefined;
        }
      });
    }

    attributeChangedCallback(): void {
      this.#render();
    }

    #settings(): ElementSettings {
      return {
        density: this.density,
        striped: this.striped,
        searchable: this.searchable,
        reloadable: this.reloadable,
        selectionAppearance: this.selectionAppearance,
        pageSize: this.pageSize,
        pageSizeOptions: this.pageSizeOptions,
      };
    }

    // Without a controller the element is empty. A new controller remounts the view (the key), so all of its parts
    // change at once.
    #render(): void {
      const controller = this.#controller;

      this.#root?.render(
        <ConfigContext value={resolved}>
          {controller === undefined
            ? null
            : <Fragment key={idOf(controller)}>{renderController(controller, this.#settings(), content)}</Fragment>}
        </ConfigContext>,
      );
    }

    // A property set on the instance before the class was defined shadows the accessor: move it through the accessor.
    #upgradeProperties(): void {
      for (const name of UPGRADED_PROPERTIES) {
        if (Object.hasOwn(this, name)) {
          const value: unknown = Reflect.get(this, name);

          Reflect.deleteProperty(this, name);
          Reflect.set(this, name, value);
        }
      }
    }
  }

  return [DataNavigatorElement, controllerFactoryOf<C>(setup)];
}

// A stable key per controller.
const ids = new WeakMap<object, number>();
let nextId = 1;

function idOf(controller: object): number {
  let id = ids.get(controller);

  if (id === undefined) {
    id = nextId++;
    ids.set(controller, id);
  }

  return id;
}
