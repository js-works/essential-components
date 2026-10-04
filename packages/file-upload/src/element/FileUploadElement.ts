import type * as Spec from '../api';
import { createPreviewUrl } from '../core/preview';
import { FileUploadStore } from '../core/store';
import type { StoreOptions } from '../core/store';
import { createLocalizer } from '../core/texts';
import type { Localizer } from '../core/texts';
import { actionsOf, hintsOf, invalidityOf, statusIconOf, statusTextOf } from '../core/view';
import type { Action, Limits } from '../core/view';
import { createIcon } from './icons';

export { FileUploadElement, setElementI18nAdapter };
export type { GetI18nAdapter };

type GetI18nAdapter = NonNullable<Spec.Config['i18n']>['getAdapter'];

type Row = {
  readonly li: HTMLLIElement;
  readonly file: File;
  readonly thumbnail: HTMLElement;
  readonly size: HTMLElement;
  readonly progress: HTMLProgressElement;
  readonly status: HTMLElement;
  readonly actions: HTMLElement;
  item: Spec.FileItem | undefined;
  preview: string | undefined;
};

const DEFAULT_MAX_PARALLEL = 3;

// Internal, not part of the public API: sets an adapter for one element, which replaces the one of the class config
// (`undefined` goes back to it). The React wrapper uses it for the adapter of its hook (`i18n.useAdapter`).
const setI18nAdapter = Symbol('setI18nAdapter');

// On hover, a tooltip appears only after this delay (ms), so a pointer passing over the buttons shows none.
const TOOLTIP_DELAY = 500;

// The properties that an app may set before the element is upgraded (see `#upgradeProperty`).
const PROPERTIES = [
  'upload',
  'accept',
  'maxFiles',
  'maxFileSize',
  'maxParallel',
  'multiple',
  'manualUpload',
  'previews',
  'density',
  'disabled',
  'name',
  'required',
  'label',
] as const satisfies readonly (keyof Spec.Element)[];

// The base class of every class that `createFileUploadClass` creates. It is not exported: each app class gets its
// styles from the factory.
class FileUploadElement extends HTMLElement implements Spec.Element {
  static readonly formAssociated = true;

  static readonly observedAttributes = [
    'accept',
    'max-files',
    'max-file-size',
    'max-parallel',
    'multiple',
    'manual-upload',
    'previews',
    'density',
    'disabled',
    'name',
    'required',
    'label',
  ] as const;

  #upload: Spec.Upload | undefined;
  readonly #getI18nAdapter: GetI18nAdapter | undefined;
  // The adapter of the class config: asked for once, on the first connect.
  #classI18n: Spec.I18nAdapter | undefined;
  #classI18nAsked = false;
  #instanceI18n: Spec.I18nAdapter | undefined;
  #localizer: Localizer;
  #unsubscribeI18n: (() => void) | undefined;
  readonly #store: FileUploadStore;
  readonly #rows = new Map<string, Row>();
  readonly #root: HTMLElement;
  readonly #input: HTMLInputElement;
  readonly #browse: HTMLButtonElement;
  readonly #limits: HTMLElement;
  readonly #hints: HTMLElement;
  readonly #prompt: HTMLElement;
  readonly #uploadAllLabel: Text;
  readonly #limitsSlot: HTMLSlotElement;
  readonly #listHeader: HTMLElement;
  readonly #uploadAll: HTMLButtonElement;
  readonly #clear: HTMLButtonElement;
  readonly #list: HTMLUListElement;
  readonly #tooltip: HTMLElement;
  #tooltipAnchor: HTMLElement | undefined;
  #tooltipTimer: ReturnType<typeof setTimeout> | undefined;
  readonly #dialog: HTMLDialogElement;
  readonly #dialogImage: HTMLImageElement;
  readonly #dialogClose: HTMLButtonElement;
  #dialogRow: Row | undefined;
  #dragDepth = 0;
  readonly #internals: ElementInternals;
  readonly #label: HTMLElement;
  readonly #labelText: Text;
  readonly #labelSlot: HTMLSlotElement;
  // Disabled by an ancestor `<fieldset>`.
  #formDisabled = false;
  #customValidity = '';

  constructor(styles: CSSStyleSheet | string, getI18nAdapter: GetI18nAdapter | undefined) {
    super();

    this.#getI18nAdapter = getI18nAdapter;
    this.#localizer = createLocalizer(undefined);
    this.#internals = this.attachInternals();
    // A group: a `<label>` of the element, `aria-label` or our own label names all of it.
    this.#internals.role = 'group';

    const shadow = this.attachShadow({ mode: 'open' });

    if (typeof styles === 'string') {
      shadow.append(create('style', {}, [styles]));
    } else {
      shadow.adoptedStyleSheets = [styles];
    }

    this.#labelText = document.createTextNode('');
    this.#labelSlot = create('slot', { name: 'label' }, [this.#labelText]);
    this.#label = create('div', { class: 'label', part: 'label', hidden: '' }, [this.#labelSlot]);
    this.#input = create('input', { type: 'file', hidden: '' });
    this.#browse = create('button', { type: 'button', class: 'text-button browse', part: 'browse-button' });
    this.#prompt = create('span');
    this.#uploadAllLabel = document.createTextNode('');
    this.#hints = create('span');
    this.#limitsSlot = create('slot', { name: 'limits' }, [this.#hints]);
    this.#limits = create('div', { class: 'limits', part: 'limits' }, [this.#limitsSlot]);
    const dropArea = create('div', { class: 'drop-area', part: 'drop-area' }, [
      create('slot', { name: 'icon' }, [createIcon('drop', 16, 'drop-icon')]),
      create('div', { class: 'prompt' }, [
        create('slot', { name: 'prompt' }, [this.#prompt]),
        this.#browse,
      ]),
      this.#limits,
      this.#input,
    ]);

    const uploadAll = create('button', { type: 'button', class: 'text-button upload-all', part: 'upload-all-button' }, [
      createIcon('upload', 14),
      this.#uploadAllLabel,
    ]);

    this.#uploadAll = uploadAll;
    this.#clear = create('button', { type: 'button', class: 'text-button clear', part: 'clear-button' });
    this.#listHeader = create('div', { class: 'list-header', hidden: '' }, [this.#clear, uploadAll]);
    this.#list = create('ul', { class: 'list', part: 'list', hidden: '' });
    this.#root = create('div', { class: 'root', part: 'root' }, [dropArea, this.#listHeader, this.#list]);
    this.#tooltip = create('div', { class: 'tooltip', part: 'tooltip', popover: 'manual', role: 'tooltip' });
    this.#dialogImage = create('img', { alt: '' });
    this.#dialogClose = create('button', { type: 'button', class: 'icon-button dialog-close' }, [
      createIcon('cancel', 16),
    ]);
    this.#dialog = create('dialog', { class: 'preview-dialog' }, [this.#dialogImage, this.#dialogClose]);

    shadow.append(this.#label, this.#root, this.#tooltip, this.#dialog);

    this.#store = new FileUploadStore(this.#storeOptions());
    this.#store.subscribe(() => {
      this.#render(false);
      this.#renderForm();
      this.dispatchEvent(new Event('change', { bubbles: true }));
    });

    this.#browse.addEventListener('click', () => this.#input.click());
    uploadAll.addEventListener('click', () => this.#store.startAll());
    // The button goes away with the files: the focus moves to "Browse".
    this.#clear.addEventListener('click', () => {
      this.#browse.focus();
      this.#store.clear();
    });
    this.#input.addEventListener('change', () => {
      this.#store.addFiles([...(this.#input.files ?? [])]);
      // Lets the same file be chosen again.
      this.#input.value = '';
    });
    // The `input` event of a file input is composed: it would leave the shadow DOM.
    this.#input.addEventListener('input', (event) => event.stopPropagation());
    this.#limitsSlot.addEventListener('slotchange', () => this.#renderLimits());
    this.#listenToLabels();
    this.#listenToDrops();
    this.#listenToDialog();
    shadow.addEventListener('keydown', (event) => {
      if (event instanceof KeyboardEvent && event.key === 'Escape') {
        this.#hideTooltip();
      }
    });

    for (const property of PROPERTIES) {
      this.#upgradeProperty(property);
    }

    this.#renderTexts();
    this.#optionsChanged();
  }

  get upload(): Spec.Upload | undefined {
    return this.#upload;
  }

  set upload(value: Spec.Upload | undefined) {
    this.#upload = value;
    this.#optionsChanged();
  }

  get accept(): string | undefined {
    return this.getAttribute('accept') ?? undefined;
  }

  set accept(value: string | undefined) {
    this.#setAttribute('accept', value);
  }

  get maxFiles(): number | undefined {
    return this.#numberAttribute('max-files');
  }

  set maxFiles(value: number | undefined) {
    this.#setAttribute('max-files', value?.toString());
  }

  get maxFileSize(): number | undefined {
    return this.#numberAttribute('max-file-size');
  }

  set maxFileSize(value: number | undefined) {
    this.#setAttribute('max-file-size', value?.toString());
  }

  get maxParallel(): number {
    const value = this.#numberAttribute('max-parallel');

    return value !== undefined && value >= 1 ? Math.floor(value) : DEFAULT_MAX_PARALLEL;
  }

  set maxParallel(value: number) {
    this.#setAttribute('max-parallel', value.toString());
  }

  get multiple(): boolean {
    return this.hasAttribute('multiple');
  }

  set multiple(value: boolean) {
    this.toggleAttribute('multiple', value);
  }

  get manualUpload(): boolean {
    return this.hasAttribute('manual-upload');
  }

  set manualUpload(value: boolean) {
    this.toggleAttribute('manual-upload', value);
  }

  get previews(): boolean {
    return this.hasAttribute('previews');
  }

  set previews(value: boolean) {
    this.toggleAttribute('previews', value);
  }

  // Missing or unknown: `normal`.
  get density(): Spec.Density {
    const value = this.getAttribute('density');

    return value === 'compact' || value === 'comfortable' ? value : 'normal';
  }

  set density(value: Spec.Density) {
    this.setAttribute('density', value);
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  get name(): string | undefined {
    return this.getAttribute('name') ?? undefined;
  }

  set name(value: string | undefined) {
    this.#setAttribute('name', value);
  }

  get required(): boolean {
    return this.hasAttribute('required');
  }

  set required(value: boolean) {
    this.toggleAttribute('required', value);
  }

  get label(): string | undefined {
    return this.getAttribute('label') ?? undefined;
  }

  set label(value: string | undefined) {
    this.#setAttribute('label', value);
  }

  get items(): readonly Spec.FileItem[] {
    return this.#store.getItems();
  }

  get form(): HTMLFormElement | null {
    return this.#internals.form;
  }

  get labels(): NodeList {
    return this.#internals.labels;
  }

  get validity(): ValidityState {
    return this.#internals.validity;
  }

  get validationMessage(): string {
    return this.#internals.validationMessage;
  }

  get willValidate(): boolean {
    return this.#internals.willValidate;
  }

  checkValidity(): boolean {
    return this.#internals.checkValidity();
  }

  reportValidity(): boolean {
    return this.#internals.reportValidity();
  }

  setCustomValidity(message: string): void {
    this.#customValidity = message;
    this.#renderForm();
  }

  attributeChangedCallback(name: string): void {
    // Only the look: the list is not rendered again.
    if (name === 'density') {
      this.#root.dataset['density'] = this.density;
    } else {
      this.#optionsChanged();
    }
  }

  // The language may have changed while the element was not on the page.
  connectedCallback(): void {
    if (!this.#classI18nAsked) {
      this.#classI18nAsked = true;
      this.#classI18n = this.#getI18nAdapter?.(this);
    }

    this.#subscribeI18n();
    this.#refreshTexts();
  }

  // Called by the browser when an ancestor `<fieldset>` is disabled or enabled.
  formDisabledCallback(disabled: boolean): void {
    this.#formDisabled = disabled;
    this.#optionsChanged();
  }

  // `form.reset()`: every upload is aborted and the list is emptied.
  formResetCallback(): void {
    this.#store.clear();
  }

  [setI18nAdapter](adapter: Spec.I18nAdapter | undefined): void {
    if (adapter === this.#instanceI18n) {
      return;
    }

    this.#instanceI18n = adapter;

    if (this.isConnected) {
      this.#unsubscribeI18n?.();
      this.#subscribeI18n();
    }

    this.#refreshTexts();
  }

  #i18n(): Spec.I18nAdapter | undefined {
    return this.#instanceI18n ?? this.#classI18n;
  }

  #subscribeI18n(): void {
    this.#unsubscribeI18n = this.#i18n()?.onChange?.(() => this.#refreshTexts());
  }

  // Moving the element disconnects and connects it again in the same task. Only an element that stays disconnected is
  // really removed: then its uploads are aborted and its previews released.
  disconnectedCallback(): void {
    this.#unsubscribeI18n?.();
    this.#unsubscribeI18n = undefined;

    queueMicrotask(() => {
      if (!this.isConnected) {
        this.#hideTooltip();
        this.#closePreview();
        this.#store.dispose();

        for (const row of this.#rows.values()) {
          this.#renderThumbnail(row);
        }
      }
    });
  }

  // A property set before the element was upgraded is an own property of the instance that hides our accessor.
  #upgradeProperty(property: (typeof PROPERTIES)[number]): void {
    if (Object.hasOwn(this, property)) {
      const value: unknown = Reflect.get(this, property);

      Reflect.deleteProperty(this, property);
      Reflect.set(this, property, value);
    }
  }

  #setAttribute(name: string, value: string | undefined): void {
    if (value === undefined) {
      this.removeAttribute(name);
    } else {
      this.setAttribute(name, value);
    }
  }

  #numberAttribute(name: string): number | undefined {
    const value = this.getAttribute(name)?.trim();
    const number = value ? Number(value) : Number.NaN;

    return Number.isFinite(number) ? number : undefined;
  }

  #storeOptions(): StoreOptions {
    return {
      upload: this.#upload,
      accept: this.accept,
      maxFiles: this.maxFiles,
      maxFileSize: this.maxFileSize,
      maxParallel: this.maxParallel,
      multiple: this.multiple,
      manualUpload: this.manualUpload,
      disabled: this.#isDisabled(),
    };
  }

  #currentLimits(): Limits {
    return { accept: this.accept, maxFiles: this.maxFiles, maxFileSize: this.maxFileSize };
  }

  // Our own `disabled`, or an ancestor `<fieldset>` that is disabled.
  #isDisabled(): boolean {
    return this.disabled || this.#formDisabled;
  }

  #optionsChanged(): void {
    this.#input.accept = this.accept ?? '';
    this.#input.multiple = this.multiple;
    this.#root.toggleAttribute('inert', this.#isDisabled());

    if (this.#isDisabled()) {
      this.#closePreview();
    }

    this.#renderLimits();
    this.#renderLabel();
    this.#store.setOptions(this.#storeOptions());
    this.#render(true);
    this.#renderForm();
  }

  // All texts again, in the locale that the adapter reports now (e.g. after a language change).
  #refreshTexts(): void {
    this.#localizer = createLocalizer(this.#i18n());
    this.#renderTexts();
    this.#renderLimits();
    this.#render(true);
    this.#renderForm();
  }

  // The form value and the validity. The value holds the result of every done file, under our `name`. A message of
  // `setCustomValidity` wins, like on an `<input>`. Failed and unfinished files are `badInput` (`customError` is left
  // to `setCustomValidity`). The browser skips a disabled element itself.
  #renderForm(): void {
    const items = this.#store.getItems();
    const name = this.name;
    const results = items.flatMap((item) => (item.status === 'done' && item.result !== undefined ? [item.result] : []));
    let value: FormData | null = null;

    if (name !== undefined && results.length > 0) {
      value = new FormData();

      for (const result of results) {
        value.append(name, result);
      }
    }

    this.#internals.setFormValue(value);

    const invalidity = invalidityOf(items, this.required);
    const custom = this.#customValidity;

    if (invalidity === undefined && custom === '') {
      this.#internals.setValidity({});

      return;
    }

    const flags: ValidityStateFlags = {
      valueMissing: invalidity === 'validationRequired',
      badInput: invalidity === 'validationFailed' || invalidity === 'validationPending',
      customError: custom !== '',
    };
    const message = custom || (invalidity === undefined ? '' : this.#localizer.text(invalidity, null));

    // The anchor: `reportValidity()` focuses it and shows the message there.
    this.#internals.setValidity(flags, message, this.#browse);
  }

  // The texts outside the rows.
  #renderTexts(): void {
    const { text } = this.#localizer;

    this.#browse.textContent = text('browse', null);
    this.#prompt.textContent = text('dropHint', null);
    this.#uploadAllLabel.data = text('uploadAll', null);
    this.#clear.textContent = text('clear', null);
    this.#list.setAttribute('aria-label', text('fileList', null));
    this.#dialogClose.setAttribute('aria-label', text('closePreview', null));
  }

  // The whole element is the drop target, also the list.
  #listenToDrops(): void {
    const area = this.#root;

    area.addEventListener('dragenter', (event) => {
      event.preventDefault();
      this.#dragDepth++;
      area.toggleAttribute('data-dragging', true);
    });

    area.addEventListener('dragover', (event) => event.preventDefault());

    area.addEventListener('dragleave', () => {
      this.#dragDepth = Math.max(0, this.#dragDepth - 1);
      area.toggleAttribute('data-dragging', this.#dragDepth > 0);
    });

    area.addEventListener('drop', (event) => {
      event.preventDefault();
      this.#dragDepth = 0;
      area.removeAttribute('data-dragging');
      this.#store.addFiles([...(event.dataTransfer?.files ?? [])]);
    });
  }

  // A click on our own label, or on a `<label>` of the element, focuses "Browse". The click on a `<label>` arrives as a
  // click on the element itself (a click inside comes from the shadow DOM). The content of the `label` slot is watched,
  // because its text is the name of the group.
  #listenToLabels(): void {
    this.#label.addEventListener('click', () => this.#browse.focus());
    this.addEventListener('click', (event) => {
      if (event.composedPath()[0] === this) {
        this.#browse.focus();
      }
    });
    this.#labelSlot.addEventListener('slotchange', () => this.#renderLabel());
    new MutationObserver(() => this.#renderLabel()).observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  // Our own label: the content of the `label` slot, else the `label` attribute. Shown only when there is one, and then
  // it names the group. Without it, a `<label>` of the element or `aria-label` does.
  #renderLabel(): void {
    const slotted = this.#labelSlot.assignedNodes();
    const text = (slotted.length > 0 ? slotted.map((node) => node.textContent ?? '').join('') : this.label ?? '')
      .trim();

    this.#labelText.data = this.label ?? '';
    this.#label.hidden = slotted.length === 0 && text === '';
    this.#internals.ariaLabel = text === '' ? null : text;
  }

  // The hints are the default content of the `limits` slot. The area is hidden when there is nothing to show.
  #renderLimits(): void {
    const hints = hintsOf(this.#currentLimits(), this.#localizer);

    this.#hints.textContent = hints.join(' · ');
    this.#limits.hidden = hints.length === 0 && this.#limitsSlot.assignedNodes().length === 0;
  }

  // Brings the list up to date. Rows whose item did not change are skipped, unless `all` is set (after an option
  // changed, e.g. a limit that a status text shows).
  #render(all: boolean): void {
    const items = this.#store.getItems();
    const limits = this.#currentLimits();
    const focused = this.shadowRoot?.activeElement;
    const ids = new Set(items.map((item) => item.id));
    let lostFocusAt: number | undefined;

    const children = [...this.#list.children];

    for (const [id, row] of this.#rows) {
      if (!ids.has(id)) {
        if (focused instanceof Node && row.li.contains(focused)) {
          lostFocusAt = children.indexOf(row.li);
        }

        this.#removeRow(id, row);
      }
    }

    items.forEach((item, index) => {
      const row = this.#rows.get(item.id) ?? this.#createRow(item.id, item.file);
      const current = this.#list.children[index];

      if (current !== row.li) {
        this.#list.insertBefore(row.li, current ?? null);
      }

      this.#updateRow(row, item, limits, all);
    });

    this.#list.hidden = items.length === 0;
    this.#listHeader.hidden = items.length === 0;
    this.#uploadAll.hidden = !items.some((item) => item.status === 'ready');

    // The focused row went away: the focus moves to the row that took its place, or the one before, or "Browse".
    if (lostFocusAt !== undefined) {
      const rows = [...this.#list.children];
      const next = rows[Math.min(lostFocusAt, rows.length - 1)]?.querySelector('button') ?? this.#browse;

      next.focus();
    }
  }

  #createRow(id: string, file: File): Row {
    const thumbnail = create('div', { class: 'thumbnail', part: 'thumbnail' });
    const progress = create('progress', { class: 'progress', part: 'progress', max: '1', 'aria-label': file.name });
    const status = create('span', { class: 'status', part: 'status' });
    const size = create('span', { class: 'size', part: 'size' });
    const actions = create('div', { class: 'actions', part: 'actions' });

    const li = create('li', { class: 'row' }, [
      thumbnail,
      create('div', { class: 'info' }, [
        create('div', { class: 'name-line' }, [
          create('span', { class: 'name', part: 'name' }, [file.name]),
          size,
        ]),
        create('div', { class: 'progress-line' }, [progress, status]),
      ]),
      actions,
    ]);

    const row: Row = { li, file, thumbnail, size, progress, status, actions, item: undefined, preview: undefined };

    this.#rows.set(id, row);

    return row;
  }

  #updateRow(row: Row, item: Spec.FileItem, limits: Limits, all: boolean): void {
    const previous = row.item;

    if (previous === item && !all) {
      return;
    }

    row.item = item;
    row.li.setAttribute('data-status', item.status);
    row.li.setAttribute('part', `row row-${item.status}`);
    row.status.textContent = statusTextOf(item, limits, this.#localizer);
    row.progress.hidden = item.status !== 'uploading';
    row.progress.value = item.progress;

    if (previous?.status !== item.status) {
      this.#renderActions(row, item);
    } else if (all) {
      this.#renderActionLabels(row);
    }

    if (previous === undefined || all) {
      row.size.textContent = this.#localizer.formatSize(row.file.size);
      this.#renderPreviewLabel(row);
    }

    this.#renderThumbnail(row);
  }

  #renderActions(row: Row, item: Spec.FileItem): void {
    const focused = this.shadowRoot?.activeElement;
    const hadFocus = focused instanceof Node && row.actions.contains(focused);

    if (this.#tooltipAnchor !== undefined && row.actions.contains(this.#tooltipAnchor)) {
      this.#hideTooltip();
    }

    row.actions.replaceChildren(...actionsOf(item.status).map((action) => this.#createAction(action, item.id)));

    // The buttons of the new status replace the clicked one: the focus stays in the row.
    if (hadFocus) {
      row.actions.querySelector('button')?.focus();
    }
  }

  // Only the labels, so the buttons (and the focus) stay.
  #renderActionLabels(row: Row): void {
    for (const button of row.actions.querySelectorAll('button')) {
      const action = button.dataset['action'];

      if (isAction(action)) {
        this.#setLabel(button, this.#localizer.text(action, null));
      }
    }
  }

  #createAction(action: Action, id: string): HTMLButtonElement {
    const button = create('button', {
      type: 'button',
      class: 'icon-button',
      part: 'action-button',
      'data-action': action,
      'aria-label': this.#localizer.text(action, null),
    }, [createIcon(action, 16)]);

    const run = {
      upload: this.#store.start,
      cancel: this.#store.cancel,
      stop: this.#store.cancel,
      retry: this.#store.retry,
      remove: this.#store.remove,
    } as const satisfies Record<Action, (id: string) => void>;

    button.addEventListener('click', () => run[action](id));
    this.#addTooltip(button);

    return button;
  }

  // The accessible name of an icon button, also in its tooltip while that is shown.
  #setLabel(button: HTMLElement, label: string): void {
    button.setAttribute('aria-label', label);

    if (button === this.#tooltipAnchor) {
      this.#tooltip.textContent = label;
    }
  }

  #addTooltip(button: HTMLElement): void {
    button.addEventListener('pointerenter', () => this.#showTooltip(button, TOOLTIP_DELAY));
    button.addEventListener('pointerleave', () => this.#hideTooltip());
    // Only for keyboard focus: a click, or the focus coming back after the dialog, shows none.
    button.addEventListener('focus', () => {
      if (button.matches(':focus-visible')) {
        this.#showTooltip(button);
      }
    });
    button.addEventListener('blur', () => this.#hideTooltip());
  }

  // An image preview while `previews` is on and the element is on the page, otherwise the icon of the status.
  #renderThumbnail(row: Row): void {
    const wanted = this.previews && this.isConnected && row.item !== undefined;

    if (wanted && row.preview === undefined && row.item !== undefined) {
      row.preview = createPreviewUrl(row.item.file);

      if (row.preview !== undefined) {
        row.thumbnail.replaceChildren(this.#createPreviewButton(row, row.preview));
      }
    }

    if (!wanted && row.preview !== undefined) {
      if (this.#tooltipAnchor !== undefined && row.thumbnail.contains(this.#tooltipAnchor)) {
        this.#hideTooltip();
      }

      if (this.#dialogRow === row) {
        this.#closePreview();
      }

      URL.revokeObjectURL(row.preview);
      row.preview = undefined;
    }

    const icon = statusIconOf(row.item?.status ?? 'ready');

    if (row.preview !== undefined) {
      this.#renderBadge(row, icon === 'spinner' ? 'pulse' : icon === 'file' ? undefined : icon);
    } else if (row.thumbnail.firstElementChild?.getAttribute('data-icon') !== icon) {
      row.thumbnail.replaceChildren(createIcon(icon, 16));
    }
  }

  // A preview is a button that opens it large in a dialog.
  #createPreviewButton(row: Row, url: string): HTMLButtonElement {
    const button = create('button', { type: 'button', class: 'preview-button' }, [
      create('img', { src: url, alt: '' }),
    ]);

    button.addEventListener('click', () => this.#openPreview(row));
    this.#addTooltip(button);
    this.#setLabel(button, this.#localizer.text('showPreview', null));

    return button;
  }

  #renderPreviewLabel(row: Row): void {
    const button = row.thumbnail.querySelector<HTMLElement>('.preview-button');

    if (button !== null) {
      this.#setLabel(button, this.#localizer.text('showPreview', null));
    }
  }

  // The dialog closes with Escape, its close button and a click next to the image, each time animated. Closing a modal
  // dialog moves the focus back to the thumbnail.
  #listenToDialog(): void {
    this.#dialogClose.addEventListener('click', () => this.#closePreview(true));
    this.#addTooltip(this.#dialogClose);
    this.#dialog.addEventListener('click', (event) => {
      if (event.target === this.#dialog) {
        this.#closePreview(true);
      }
    });
    // Escape: instead of the native close (at once), the animated one.
    this.#dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      this.#closePreview(true);
    });
    // The image stays while the dialog fades out. The next preview replaces it.
    // Only the tooltip of the close button: the one of the thumbnail (focused again) may be shown already.
    this.#dialog.addEventListener('close', () => {
      if (this.#tooltipAnchor !== undefined && this.#dialog.contains(this.#tooltipAnchor)) {
        this.#hideTooltip();
      }

      this.#dialogRow = undefined;
    });
  }

  #openPreview(row: Row): void {
    if (row.preview === undefined) {
      return;
    }

    this.#hideTooltip();
    this.#dialogRow = row;
    this.#dialogImage.src = row.preview;
    this.#dialog.setAttribute('aria-label', row.file.name);

    try {
      this.#dialog.showModal();
    } catch {
      // Not on the page (any more): nothing to show.
      this.#dialogRow = undefined;
    }
  }

  // Animated: the dialog fades out first (`data-closing`, see the CSS) and is closed when that has ended. Without
  // animations (reduced motion, no Web Animations API) it closes at once. Closes that the user did not ask for (e.g.
  // the row went away) are never animated.
  #closePreview(animated = false): void {
    const dialog = this.#dialog;

    if (!dialog.open) {
      return;
    }

    if (!animated) {
      dialog.removeAttribute('data-closing');
      dialog.close();

      return;
    }

    if (dialog.hasAttribute('data-closing')) {
      return;
    }

    dialog.toggleAttribute('data-closing', true);

    // Reading the animations applies the new style first, so the transitions it starts are included.
    const animations = typeof dialog.getAnimations === 'function' ? dialog.getAnimations() : [];

    if (animations.length === 0) {
      this.#closePreview();

      return;
    }

    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (dialog.hasAttribute('data-closing')) {
        dialog.removeAttribute('data-closing');
        dialog.close();
      }
    });
  }

  // The status on a preview: a small badge in its corner. A pulsing dot while uploading, a checkmark or a warning mark
  // for the result, else none.
  #renderBadge(row: Row, badge: 'pulse' | 'done' | 'warning' | undefined): void {
    const current = row.thumbnail.querySelector('.badge');

    if ((current?.getAttribute('data-badge') ?? undefined) === badge) {
      return;
    }

    current?.remove();

    if (badge !== undefined) {
      const children = badge === 'pulse' ? [] : [createIcon(badge, 8)];

      row.thumbnail.append(create('span', { class: 'badge', 'data-badge': badge }, children));
    }
  }

  #removeRow(id: string, row: Row): void {
    if (this.#tooltipAnchor !== undefined && row.li.contains(this.#tooltipAnchor)) {
      this.#hideTooltip();
    }

    if (this.#dialogRow === row) {
      this.#closePreview();
    }

    if (row.preview !== undefined) {
      URL.revokeObjectURL(row.preview);
    }

    row.li.remove();
    this.#rows.delete(id);
  }

  // After the delay (hover), or at once (keyboard focus).
  #showTooltip(button: HTMLElement, delay = 0): void {
    this.#hideTooltip();

    if (delay > 0) {
      this.#tooltipTimer = setTimeout(() => {
        this.#tooltipTimer = undefined;

        if (button.isConnected) {
          this.#showTooltip(button);
        }
      }, delay);

      return;
    }

    this.#tooltipAnchor = button;
    button.toggleAttribute('data-tooltip-anchor', true);
    this.#tooltip.textContent = button.getAttribute('aria-label');

    try {
      this.#tooltip.showPopover();
    } catch {
      // Not on the page (any more): nothing to show.
    }
  }

  #hideTooltip(): void {
    clearTimeout(this.#tooltipTimer);
    this.#tooltipTimer = undefined;
    this.#tooltipAnchor?.removeAttribute('data-tooltip-anchor');
    this.#tooltipAnchor = undefined;

    try {
      this.#tooltip.hidePopover();
    } catch {
      // Already hidden.
    }
  }
}

// Internal, for the React wrapper: an adapter for one element (see `setI18nAdapter`).
function setElementI18nAdapter(element: Spec.Element, adapter: Spec.I18nAdapter | undefined): void {
  if (element instanceof FileUploadElement) {
    element[setI18nAdapter](adapter);
  }
}

function isAction(value: string | undefined): value is Action {
  return value === 'upload' || value === 'cancel' || value === 'stop' || value === 'retry' || value === 'remove';
}

// Creates an element with attributes and children.
function create<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Readonly<Record<string, string>> = {},
  children: readonly (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }

  element.append(...children);

  return element;
}
