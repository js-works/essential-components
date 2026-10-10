import { Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import type { DataTable } from '../api';
import { checkI18nType, ConfigContext, resolveConfig } from '../core/config';
import type { ResolvedConfig } from '../core/config';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from '../core/useDataTable';
import { contentRendererOf, nodeContent } from './content';
import { bindController, controllerFactoryOf, releaseController, renderController } from './controller';
import type { ElementSettings } from './controller';
import { HOST_ATTRIBUTE, provideStyles } from './styles';

export { setupDataTable };

const DENSITIES: readonly DataTable.Density[] = ['compact', 'normal', 'comfortable'];
const LAYOUTS: readonly DataTable.Layout[] = ['auto', 'table', 'cards'];
const FOOTER_MODES: readonly DataTable.FooterMode[] = ['always', 'auto', 'never'];
const ROW_ACTION_LOOKS: readonly DataTable.RowActionLook[] = ['icon', 'label', 'iconAndLabel'];
const SELECTION_APPEARANCES: readonly DataTable.SelectionAppearance[] = ['neutral', 'accent'];

// The events that stop at the element's border (see the constructor).
const CONTAINED_EVENTS = ['input', 'keypress', 'keydown'] as const;

// The properties an app (or a framework) may set before the element is defined: taken over when it is upgraded.
const UPGRADED_PROPERTIES = [
  'controller',
  'density',
  'layout',
  'footer',
  'striped',
  'searchable',
  'reloadable',
  'showTotal',
  'selectableGroups',
  'rowActionLook',
  'selectionAppearance',
  'pageSize',
  'pageSizeOptions',
] as const;

// Called once per app, with the app's theme, i18n factory, content adapter and the defaults of its elements. Returns an element class (not
// registered: the app registers it under a tag name of its choice) and the factory of its controllers, both bound to
// this configuration. The element wraps the React view, rendered into its light DOM.
function setupDataTable<C = Node>(
  config: DataTable.SetupConfig<C> = {},
): readonly [DataTable.ElementClass<C>, DataTable.CreateTableController<C>] {
  checkI18nType(config.i18n, ['factory']);

  const resolved = resolveConfig(config.theme);
  const defaults = config.defaults ?? {};
  const getI18nAdapter = config.i18n?.getAdapter;
  // Without an adapter, `C` is `Node` (the default of the type parameter), and the default adapter renders nodes.
  const content = contentRendererOf((config.content ?? nodeContent) as DataTable.ContentAdapter<unknown>);
  // The identity of this setup: its controllers are only accepted by its element class.
  const setup = {};

  class DataTableElement extends HTMLElement {
    static observedAttributes = [
      'density',
      'layout',
      'footer',
      'striped',
      'searchable',
      'reloadable',
      'show-total',
      'selectable-groups',
      'row-action-look',
      'selection-appearance',
      'page-size',
    ];

    #controller: DataTable.TableController<unknown, C> | undefined;
    // With the i18n adapter of this element: the factory is asked once, on the first connect, with the element.
    #config: ResolvedConfig | undefined;
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

    get controller(): DataTable.TableController<unknown, C> | undefined {
      return this.#controller;
    }

    set controller(controller: DataTable.TableController<unknown, C> | undefined) {
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

    get density(): DataTable.Density {
      const value = this.getAttribute('density');

      return DENSITIES.find((density) => density === value) ?? defaults.density ?? 'normal';
    }

    set density(density: DataTable.Density) {
      this.setAttribute('density', density);
    }

    // The layout of the rows: fixed by the app (and no choice in the column menu), or not set (the user chooses).
    get layout(): DataTable.Layout | undefined {
      const value = this.getAttribute('layout');

      return LAYOUTS.find((layout) => layout === value) ?? defaults.layout;
    }

    set layout(layout: DataTable.Layout | undefined) {
      if (layout === undefined) {
        this.removeAttribute('layout');
      } else {
        this.setAttribute('layout', layout);
      }
    }

    get footer(): DataTable.FooterMode {
      const value = this.getAttribute('footer');

      return FOOTER_MODES.find((mode) => mode === value) ?? defaults.footer ?? 'always';
    }

    set footer(footer: DataTable.FooterMode) {
      this.setAttribute('footer', footer);
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

    // The total of the rows after the title.
    get showTotal(): boolean {
      return this.hasAttribute('show-total');
    }

    set showTotal(show: boolean) {
      this.toggleAttribute('show-total', show);
    }

    // A checkbox in every group header (with `groupBy` and multi selection) that selects the rows of the group.
    get selectableGroups(): boolean {
      return this.hasAttribute('selectable-groups');
    }

    set selectableGroups(selectable: boolean) {
      this.toggleAttribute('selectable-groups', selectable);
    }

    // What the action column shows of an action: its icon (the default), its label, or both.
    get rowActionLook(): DataTable.RowActionLook {
      const value = this.getAttribute('row-action-look');

      return ROW_ACTION_LOOKS.find((look) => look === value) ?? defaults.rowActionLook ?? 'icon';
    }

    set rowActionLook(look: DataTable.RowActionLook) {
      this.setAttribute('row-action-look', look);
    }

    get selectionAppearance(): DataTable.SelectionAppearance {
      const value = this.getAttribute('selection-appearance');

      return SELECTION_APPEARANCES.find((appearance) => appearance === value) ?? defaults.selectionAppearance
        ?? 'accent';
    }

    set selectionAppearance(appearance: DataTable.SelectionAppearance) {
      this.setAttribute('selection-appearance', appearance);
    }

    // The page size the table starts with (a positive integer; anything else means the default).
    get pageSize(): number {
      const value = Number(this.getAttribute('page-size'));

      return Number.isInteger(value) && value > 0 ? value : defaults.pageSize ?? DEFAULT_PAGE_SIZE;
    }

    set pageSize(pageSize: number) {
      this.setAttribute('page-size', String(pageSize));
    }

    get pageSizeOptions(): readonly number[] {
      return this.#pageSizeOptions ?? defaults.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;
    }

    set pageSizeOptions(options: readonly number[]) {
      this.#pageSizeOptions = options;
      this.#render();
    }

    connectedCallback(): void {
      this.#upgradeProperties();
      this.setAttribute(HOST_ATTRIBUTE, '');
      provideStyles(this);

      this.#config ??= { ...resolved, i18n: getI18nAdapter?.(this) };

      // Moved within one task (removed and added again): the root is still there.
      if (this.#root === undefined) {
        this.#root = createRoot(this);
        // The React view renders its own texts again on a change of the language; the content functions of the
        // controller's options are called again by rendering everything.
        this.#stopListening = this.#config.i18n?.onChange?.(() => this.#render());
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
        layout: this.layout,
        footer: this.footer,
        striped: this.striped,
        searchable: this.searchable,
        reloadable: this.reloadable,
        showTotal: this.showTotal,
        selectableGroups: this.selectableGroups,
        rowActionLook: this.rowActionLook,
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
        <ConfigContext value={this.#config ?? resolved}>
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

  return [DataTableElement, controllerFactoryOf<C>(setup)];
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
