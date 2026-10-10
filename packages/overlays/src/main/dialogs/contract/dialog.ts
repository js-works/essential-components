// -------------------------------------------------------------------
// # The dialog vocabulary
//
// The controller call surface (DialogsController / DialogsControllerConfig) plus the
// per-dialog config and result types.
// -------------------------------------------------------------------

import type { DialogAdapterFactory } from "./adapter.js";
import type { DialogTheme } from "./theme.js";
import type { Renderable } from "./content.js";
import type { DialogTexts } from "./texts.js";
import type { FormDialogData } from "./form-data.js";

// Re-export the content type so the public type surface can be named from one place.
export type { Renderable } from "./content.js";

export type DialogType =
  | "info"
  | "success"
  | "warn"
  | "error"
  | "confirm"
  | "confirmCritical"
  | "decide"
  | "decideCritical"
  | "form"
  | "formCritical";

/**
 * Where a dialog is shown, independent of its type (see {@link DialogConfig.surface}):
 * `"dialog"` is the centered box, `"drawer"` a full-height panel sliding in from the
 * inline-end edge.
 */
export type DialogSurface = "dialog" | "drawer";

/**
 * How wide a dialog or a drawer is (see {@link DialogConfig.width}): `"default"` the
 * surface's own sizing (a centered dialog fits its text, up to 26em; a drawer is 30em),
 * `"wide"` 48em, `"extraWide"` 64em, `"full"` the whole viewport but a margin (2em on each
 * side of a dialog, 2em on the open side of a drawer). Never wider than the viewport.
 */
export type DialogWidth = "default" | "wide" | "extraWide" | "full";

/** A button's look. `"link"` only for an action (see {@link DialogAction.variant}). */
export type ActionButtonType = "primary" | "secondary" | "danger" | "link";

/**
 * A button of its own, beside the built-in ones (see {@link DialogConfig.actions}). Like
 * them it ends the dialog: the result's `action` is its id.
 */
export interface DialogAction {
  text: string;
  /**
   * Default `"secondary"`: with the built-in buttons. `"danger"` (e.g. "Delete" in an edit
   * form) and `"link"` (a text-only button, e.g. "Not now") stand separate, on the other
   * side of the footer.
   */
  variant?: "secondary" | "danger" | "link";
  /**
   * Form dialogs only. Default `true`: it submits like the confirm button (native
   * validation, the {@link FormValidator}). `false` skips that; the result carries the
   * form's data either way. A form that confirms itself (`<Form confirm>`) is not run for
   * an action: the caller handles it from the result.
   */
  validate?: boolean;
}

/** The buttons of its own a dialog adds, by id: the text, or a {@link DialogAction}. */
export type DialogActions<A extends string> = { [K in A]: string | DialogAction };

/**
 * Which button this is, semantically. Also the key a caller overrides its label under
 * (see {@link DialogViewConfig.buttons}). A decide dialog's Yes/No are `confirm` and
 * `decline` with different default text, not roles of their own — the four values here
 * are exactly the outcomes a click can produce.
 */
export type ButtonRole = "ok" | "confirm" | "decline" | "cancel";

/** Descriptor passed to a custom action-button renderer. */
export interface ActionButtonRender {
  /** A built-in button's role, or `"action"` for one of {@link DialogConfig.actions}. */
  role: ButtonRole | "action";
  /** The id of an action (`role: "action"`). */
  action?: string;
  text: string;
  variant: ActionButtonType;
  loading: boolean;
  onClick: () => void;
}

/** Descriptor passed to a custom close-button renderer. */
export interface CloseButtonRender {
  onClose: () => void;
}

/**
 * Descriptor passed to a custom maximize-button renderer (see
 * {@link DialogConfig.maximizable}). One button with two states, like the button of a
 * window: it maximizes the dialog, and restores it while maximized.
 */
export interface MaximizeButtonRender {
  /** Whether the dialog fills the viewport now. */
  maximized: boolean;
  /** The button's text for its state, already translated: "Maximize" or "Restore". */
  label: string;
  onToggle: () => void;
}

/**
 * Descriptor passed to a custom note renderer (see {@link FormAttempt.reject}). Plain
 * strings, because the library's own note box is shadow chrome and can only be filled
 * with data — an override replaces the whole box, so it gets the same values.
 */
export interface NoteRender {
  title?: string;
  message: string;
  /**
   * `"error"`: a {@link FormAttempt.reject}. `"question"`: a question of
   * {@link FormAttempt.ask}, while the buttons are its answers (with `critical`
   * an `"error"` too).
   */
  tone: "error" | "question";
}

/**
 * Optional per-part render overrides. Each is all-or-nothing: when provided, the library
 * renders nothing of its own for that part and inserts the returned Renderable instead
 * (so the caller can drop in their design system's components). A custom part supplies
 * its own states/animation from the descriptor — e.g. a custom action button shows its
 * own loading state, and a custom reject message provides its own enter/leave animation.
 *
 * Overrides return `C` — real framework content, nothing else. `null` or a bare string
 * would be a half-override, and "render nothing here" is said by leaving the override out.
 */
export interface DialogRenderOverrides<C extends object> {
  actionButton?(button: ActionButtonRender): C;
  closeButton?(close: CloseButtonRender): C;
  /** Only rendered for a dialog with {@link DialogConfig.maximizable}. */
  maximizeButton?(button: MaximizeButtonRender): C;
  note?(note: NoteRender): C;
}

export interface DialogsControllerConfig<C extends object> {
  /**
   * Renders this controller's dialogs, and is the source `C` is inferred from: pass
   * `litDialogAdapter` and every `content`/`title`/override-return on this controller is
   * typed to that framework's content.
   *
   * Required, deliberately: choosing how content is rendered is a decision no default can
   * make for you. Use {@link domDialogAdapter} for plain DOM nodes.
   */
  adapter: DialogAdapterFactory<C>;
  /**
   * Where a dialog is mounted: read each time one opens. Default (and while it returns
   * nothing): `document.body`. The React provider sets it to its own mount point, so the
   * dialogs live where the provider is - in a shadow root too, where the content then
   * gets the styles of that root. A modal `<dialog>` is in the top layer wherever it is.
   */
  mountTarget?: () => ParentNode | null | undefined;
  /**
   * Theme tokens for this controller's dialogs; omit for the built-in look. (Toasts have
   * their own {@link ToastTheme}.)
   *
   * A complete theme, not a patch: build it with {@link createDialogTheme}, which fills
   * the tokens you don't name from the defaults. One way to make a theme instead of two.
   */
  theme?: DialogTheme;
  getText?(textKey: keyof DialogTexts): string | undefined;
  /**
   * Header-icon policy for this controller's dialogs, overridden per dialog by
   * {@link DialogViewConfig.icon}. `true` uses the built-in icon for each type, `false`
   * shows none, a function decides per type — returning `true` for the built-in one,
   * `false` for none, or content of its own.
   */
  icons?: boolean | ((dialogType: DialogType) => C | boolean);
  render?: DialogRenderOverrides<C>;
  /**
   * Put something around every dialog's content before it is rendered. Unlike
   * {@link DialogRenderOverrides}, which replace a part the library would otherwise draw,
   * this leaves the content alone and only surrounds it.
   *
   * The case it exists for is a wrapper that has to be *inside* the dialog to work: a
   * scoped theme provider, or a portal target a component library can aim its popups at
   * so they land in the top layer with the dialog rather than behind it. Doing that per
   * `content` works too, but forgetting it on one dialog fails silently, which is the
   * kind of mistake a config option takes off the table.
   *
   * Called with the content the caller passed - which may be a plain string - and a
   * description of the dialog it belongs to, so a wrapper can skip the dialogs that
   * cannot contain anything to wrap:
   *
   *   wrapContent: (content, { hasForm }) =>
   *     hasForm ? h(FormProviders, null, content) : content
   *
   * Not called when a dialog has no content at all.
   */
  wrapContent?(content: Renderable<C>, dialogInfo: DialogInfo): Renderable<C>;
}

/** What {@link DialogsControllerConfig.wrapContent} is told about the dialog it is wrapping. */
export interface DialogInfo {
  dialogType: DialogType;
  /** Whether the content slot is wrapped in a <form> (form dialogs). */
  hasForm: boolean;
  surface: DialogSurface;
}

/**
 * Everything a dialog paints. Valid when it opens *and* on every later update, which is
 * the point of the split: an open dialog can be re-rendered from these fields alone.
 *
 * Behavioural options live one level down, in {@link DialogConfig} and below, so
 * "what may change while open" is expressed by inheritance rather than by subtracting
 * names. Add a behavioural field there and it is excluded from updates automatically —
 * there is no list to keep in sync.
 */
export interface DialogViewConfig<C extends object> {
  title?: Renderable<C>;
  subtitle?: Renderable<C>;
  /**
   * Header icon. `true` shows the built-in icon for this dialog type, `false` hides it,
   * content supplies a custom icon; omit to defer to the controller's
   * {@link DialogsControllerConfig.icons} policy.
   */
  icon?: C | boolean;
  intro?: Renderable<C>;
  content?: Renderable<C>;
  outro?: Renderable<C>;
  /** Caller-supplied CSS, scoped per-instance by the core. */
  styles?: string;
  /** Caller overrides for button labels, keyed by button role. */
  buttons?: Partial<Record<ButtonRole, string>>;
}

/**
 * A dialog's view plus the wiring that is fixed for its lifetime. Everything added here
 * (rather than to {@link DialogViewConfig}) is settable only when the dialog opens.
 */
export interface DialogConfig<C extends object, A extends string = never>
  extends DialogViewConfig<C> {
  /**
   * Buttons of its own, beside the built-in ones (whose labels `buttons` changes), by id:
   *
   *   actions: { draft: "Save draft", delete: { text: "Delete", variant: "danger" } }
   *
   * Each ends the dialog like the built-in ones, and its id is the result's `action`
   * (typed: `"confirm" | "draft" | "delete"`). In the order given, after the primary
   * button; `"danger"` and `"link"` ones separate, on the other side of the footer. Enter
   * never triggers one.
   *
   * Behavioural like `surface`: fixed once the dialog is open.
   */
  actions?: DialogActions<A>;
  /**
   * Where the dialog is shown. Default `"dialog"`, the centered box. `"drawer"` is a
   * full-height panel sliding in from the inline-end edge, for content too wide or too
   * tall for a centered dialog: details, a long form. Still a modal `<dialog>`, so focus
   * trapping, the inert background and Escape behave identically, and every dialog type
   * works on it (an info drawer has just "OK", a form drawer "OK" and "Cancel").
   *
   * Behavioural, so it is not part of {@link DialogViewConfig}: fixed once the dialog is
   * open.
   */
  surface?: DialogSurface;
  /**
   * The width of the dialog or drawer (see {@link DialogWidth}). Default `"default"`. With
   * a named width (and in every drawer), content that needs more room (a `min-width`, a
   * wide table) still widens it, up to the viewport: it is as wide as its content's
   * narrowest layout (`min-content`), at least this width. A centered dialog of a named
   * width is also centered vertically (the default one is anchored near the top).
   *
   * Behavioural like `surface`: fixed once the dialog is open.
   */
  width?: DialogWidth;
  /**
   * Whether the dialog has a Maximize button, before its close button. Default `false`.
   * Maximized, the dialog or drawer fills the whole viewport (no margin, no rounding; the
   * header and the buttons stay, the body scrolls), and the button becomes Restore, which
   * brings back its size. Every dialog starts unmaximized, also the next one of a scope.
   *
   * While maximized, the dialog element has the attribute `data-maximized`, and the
   * element that holds the content is as high as the body's free room. The element is an
   * ancestor of the content in the light DOM, so a page's CSS can let content fill the
   * height then (e.g. `[data-maximized] .editor { height: 100%; }`).
   *
   * Behavioural like `surface`: fixed once the dialog is open.
   */
  maximizable?: boolean;
  /**
   * Abort this dialog. When the signal aborts, the dialog closes immediately and the
   * call resolves `{ canceled: true, aborted: true }`. Combined with any scope-level
   * signal passed to `open()`.
   *
   * Behavioural, so it is not part of {@link DialogViewConfig}: the listener is attached
   * when the dialog opens, and swapping the signal later would silently detach it.
   */
  abortSignal?: AbortSignal;
}

/**
 * Client-side pre-validation for a form dialog. An object rather than a bare function so
 * further capabilities can be added without breaking the signature - and so ready-made
 * validators (for a schema library, say) have a natural shape.
 */
export interface FormValidator {
  /**
   * Run when a confirm-type button is clicked, after native constraint validation
   * (`reportValidity()`) passes and before the attempt is submitted. Return `false` to
   * keep the dialog open - unlike `reject()`, which is for server-round-trip results,
   * this is for a caller-owned validation library (Zod, Valibot, ...) that native HTML5
   * constraints can't express.
   *
   * With {@link FormDialogConfig.nativeValidation} set to `false` there is no native pass
   * to clear first, and this is the only verdict on the form.
   *
   * The library has no opinion on how invalid state is shown: the caller's own content
   * renders its own errors, and since content is rendered by your framework (not copied
   * in by the core), re-rendering that subtree is yours to do and safe at any time.
   *
   * It does have one on where to look next. When this turns a click down, focus moves to
   * the form's first control marked `aria-invalid="true"`, so the field that has to change
   * is ready to type in. That needs nothing from the validator: it is the attribute a
   * screen reader reads to announce a field as invalid, so a form layer that renders
   * accessible errors is already setting it.
   *
   * If nothing is marked invalid, `[autofocus]` is used instead - the same marker that
   * wins when the dialog opens - which lets a caller point at a field explicitly. With
   * neither, focus stays on the button that was clicked, which is what "press Enter to
   * retry" wants. Note that React's `autoFocus` prop does not produce that attribute: it
   * is applied by calling focus() on mount, so write `autofocus` literally for it to be
   * found.
   *
   * May return a promise - which is what schema libraries with async refinements and
   * form libraries like React Hook Form (whose `trigger()` is async) need. While one is
   * pending:
   *
   * - the clicked button shows its usual spinner, on the usual 150ms delay, because the
   *   click handler is simply still running;
   * - further clicks on validating buttons are dropped, so a second validation cannot
   *   start and a form dialog cannot queue a second attempt;
   * - Cancel, Escape and the close button stay live. A slow validator must not trap the
   *   user, so a verdict arriving after the dialog is gone is discarded.
   *
   * A rejected promise counts as invalid - the dialog stays open - and the error is
   * rethrown rather than swallowed, so a broken validator surfaces instead of looking
   * like a click that did nothing.
   */
  validate(form: HTMLFormElement): boolean | Promise<boolean>;
}

/**
 * The outcome of a form that confirms its dialog itself (see {@link FormConfirm}).
 *
 * - `{ ok: true }`: done (e.g. saved) — the dialog closes as confirmed.
 * - `{ ok: false }`: not valid — the dialog stays open, focus goes to the first invalid field.
 * - `{ ok: false, error }`: failed (e.g. the save) — the dialog stays open and shows `error`
 *   as its note.
 */
export type FormConfirmResult = { ok: true } | { ok: false; error?: string };

/**
 * A form's own confirmation: run on the confirm click of a form dialog instead of the
 * dialog's validation (native constraints, {@link FormValidator}). It validates, does the
 * work (e.g. saves the parsed data) and says how it went. While a returned promise is
 * pending, the button shows its spinner. A framework binding registers it from the
 * dialog's content (React: `<Form confirm={…}>`).
 */
export type FormConfirm = () => FormConfirmResult | Promise<FormConfirmResult>;

export interface FormDialogConfig<C extends object, A extends string = never>
  extends DialogConfig<C, A> {
  validator?: FormValidator;
  /**
   * Whether the browser validates the form itself. Default `true`: constraint attributes
   * (`required`, `type="email"`, `minLength`, ...) are checked on a confirm click and the
   * first failure is reported in a native bubble, before {@link FormValidator.validate}
   * ever runs.
   *
   * Set `false` to put `novalidate` on the form and hand reporting entirely to your own
   * content. The attributes stay where they are, so assistive technology and mobile
   * keyboards still read them - only the browser's UI steps aside, and one kind of
   * problem then has one presentation instead of two.
   *
   * This is the option to reach for when a schema is the single source of truth. Omitting
   * the attributes is not an equivalent lever: `type="date"` and `type="number"` set
   * `badInput` on a half-typed value no matter what you leave off, so a native bubble can
   * appear in a form that declares no constraints at all.
   *
   * Behavioural, so it is not part of {@link DialogViewConfig}: it is read on each confirm
   * click and reflected on the form element, and is fixed once the dialog is open.
   */
  nativeValidation?: boolean;
  /**
   * Whether Cancel, Escape and the close button only *ask* to close. Default `false`: they
   * close the dialog at once. With `true`, while the handle is iterated (`for await`), each
   * of them is handed to the loop as a {@link FormCloseAttempt} instead, and the caller
   * decides: `accept()` closes the dialog as canceled, `reject()` keeps it open with
   * everything typed. The case it exists for is unsaved changes ("Discard your changes?").
   *
   * Only the caller knows whether something would be lost. Without `guardClose` (or without
   * a loop) the dialog asks by itself only when its content says it has changes (React:
   * `<Form dirty>`); with it the loop decides. An abort (`abort()`, a signal, a disposed
   * scope) never asks.
   *
   * Behavioural, so it is not part of {@link DialogViewConfig}: fixed once the dialog is
   * open. Typed: with `guardClose: true` the loop gets `FormAttempt | FormCloseAttempt`.
   */
  guardClose?: boolean;
}

// Not exported: the ten methods exist so DialogScope and DialogsController can
// share them. Code that wants to accept either writes the union of those two.
//
// `A` is the ids of the dialog's own actions (see DialogConfig.actions), inferred from
// its keys; without `actions` it is `never`, and the results are as without them.
interface DialogMethods<C extends object> {
  info<A extends string = never>(
    config: DialogConfig<C, A>,
  ): DialogHandle<MessageDialogResult<A>, C>;
  success<A extends string = never>(
    config: DialogConfig<C, A>,
  ): DialogHandle<MessageDialogResult<A>, C>;
  warn<A extends string = never>(
    config: DialogConfig<C, A>,
  ): DialogHandle<MessageDialogResult<A>, C>;
  error<A extends string = never>(
    config: DialogConfig<C, A>,
  ): DialogHandle<MessageDialogResult<A>, C>;
  confirm<A extends string = never>(
    config: DialogConfig<C, A>,
  ): DialogHandle<ConfirmDialogResult<A>, C>;
  confirmCritical<A extends string = never>(
    config: DialogConfig<C, A>,
  ): DialogHandle<ConfirmDialogResult<A>, C>;
  decide<A extends string = never>(
    config: DialogConfig<C, A>,
  ): DialogHandle<DecideDialogResult<A>, C>;
  decideCritical<A extends string = never>(
    config: DialogConfig<C, A>,
  ): DialogHandle<DecideDialogResult<A>, C>;
  /**
   * A form dialog. One method covers both submission styles, because
   * {@link FormDialogHandle} is awaitable *and* async-iterable:
   *
   * ```ts
   * // optimistic — resolves on the first valid submit and closes
   * const result = await dialogs.form({ title: "Edit customer", content });
   *
   * // pessimistic — stays open, with the user's input intact, until the server agrees
   * const form = dialogs.form({ title: "Edit customer", content });
   * for await (const attempt of form) {
   *   (await save(attempt.data)) ? attempt.accept() : attempt.reject("Name taken");
   * }
   * ```
   *
   * Awaiting without iterating auto-accepts the first valid submit, so the short form
   * needs no separate method.
   *
   * With {@link FormDialogConfig.guardClose}, the loop also gets the requests to close:
   *
   * ```ts
   * const form = dialogs.form({ title: "Edit customer", content, guardClose: true });
   * for await (const attempt of form) {
   *   if (attempt.kind === "close") {
   *     const discard = !changed || (await attempt.ask("Discard your changes?", { confirm: "Discard", critical: true }));
   *     discard ? attempt.accept() : attempt.reject();
   *   } else {
   *     (await save(attempt.data)) ? attempt.accept() : attempt.reject("Name taken");
   *   }
   * }
   * ```
   */
  form<A extends string = never, G extends boolean = false>(
    config: FormDialogConfig<C, A> & { guardClose?: G },
  ): FormDialogHandle<C, A, FormAttemptOf<G, A>>;
  /** {@link DialogMethods.form} with destructive styling and no Enter-to-confirm. */
  formCritical<A extends string = never, G extends boolean = false>(
    config: FormDialogConfig<C, A> & { guardClose?: G },
  ): FormDialogHandle<C, A, FormAttemptOf<G, A>>;
}

/**
 * What a form dialog's loop gets: submits only, or with `guardClose: true` (or a `boolean`
 * that may be true) the requests to close too. Not distributed, so `boolean` gives the union.
 */
export type FormAttemptOf<G extends boolean, A extends string = never> = [G] extends [false]
  ? FormAttempt<A>
  : FormAttempt<A> | FormCloseAttempt;

export interface DialogsController<C extends object> extends DialogMethods<C> {
  /**
   * Open a scope whose dialogs share one modal surface (the backdrop stays up for the
   * whole scope). An optional `signal` aborts every dialog opened in the scope.
   */
  open(signal?: AbortSignal): DialogScope<C>;
  /**
   * Close every dialog this controller still has on screen and settle their callers as
   * `{ canceled: true, aborted: true }` — the same result an `abortSignal` produces,
   * because it is the same situation: the dialog is gone and nobody can answer it any
   * more. Without this a caller awaiting `confirm()` would wait forever.
   *
   * The controller stays usable afterwards; it only lets go of what is open. Mirrors
   * {@link ToastsController.destroy}, and is what a React provider calls when it unmounts.
   */
  abortAll(): void;
}

export interface DialogScope<C extends object> extends DialogMethods<C> {
  /**
   * Close the scope: tear down the shared modal surface and cancel anything still
   * pending in it. Call this directly when you aren't using a `using` declaration.
   */
  dispose(): void;
  /**
   * Alias of {@link close} so a scope works with `using`. Only present when the runtime
   * provides `Symbol.dispose`; otherwise call {@link dispose} directly.
   */
  [Symbol.dispose](): void;
}

// The three ways a dialog can end, named separately so each kind of dialog can say which
// of them it is actually able to produce. `canceled` discriminates answer from no-answer;
// `aborted` says why there was no answer.

/** The user answered. `A` is which answers this kind allows, `T` any data it carries. */
export interface Answered<A extends string, T = undefined> {
  canceled: false;
  action: A;
  data: T;
}

/** The user made it go away without answering: cancel button, close button, Escape. */
export interface Dismissed {
  canceled: true;
  aborted: false;
}

/** It was taken away programmatically: `abort()`, an `abortSignal`, a disposed scope. */
export interface Aborted {
  canceled: true;
  aborted: true;
}

/**
 * Result of the acknowledge-only dialogs: info, success, warn, error.
 *
 * No {@link Dismissed}: these have no cancel button, and dismissing a message *is*
 * acknowledging it — so Escape and the close button resolve as `ok` like the button does.
 * The only way here without an answer is an abort.
 *
 * `A` in each: the ids of the dialog's own actions (see {@link DialogConfig.actions}).
 */
export type MessageDialogResult<A extends string = never> = Answered<"ok" | A> | Aborted;
export type ConfirmDialogResult<A extends string = never> =
  | Answered<"confirm" | A>
  | Dismissed
  | Aborted;
export type DecideDialogResult<A extends string = never> =
  | Answered<"confirm" | "decline" | A>
  | Dismissed
  | Aborted;
export type FormDialogResult<A extends string = never> =
  | Answered<"confirm" | A, FormDialogData>
  | Dismissed
  | Aborted;

/** One submission of a form dialog while iterating for retry (see {@link DialogMethods.form}). */
export interface FormAttempt<A extends string = never> {
  /** Tells it apart from a {@link FormCloseAttempt} in a loop with `guardClose`. */
  readonly kind: "submit";
  /** The button that submitted: the confirm button, or one of the dialog's own actions. */
  readonly action: "confirm" | A;
  readonly data: FormDialogData;
  /**
   * Accept the submission: resolve the dialog and close it. Pass data to resolve with
   * something other than what was collected — normalised or server-completed values, say.
   */
  accept(data?: FormDialogData): void;
  /**
   * Reject it: keep the dialog open (values preserved) and show a note with this text,
   * and an optional heading. A reject is always styled as an error.
   */
  reject(message: string, title?: string): void;
  /** Ask a question in place of the dialog's content before deciding (see {@link FormAskOptions}). */
  ask(message: string, options?: FormAskOptions): Promise<boolean>;
  /** Ask with more than two answers (see {@link FormAskChoicesOptions}): resolves the id of the chosen one. */
  ask<K extends string>(message: string, options: FormAskChoicesOptions<K>): Promise<K>;
  /**
   * Ask "Discard your changes?" in place of the content, with the dialog's own texts
   * (translated): `askDiscard()` is `ask()` with the library's discard question, its
   * Discard (critical) and Keep editing buttons and the title "Unsaved changes".
   * Resolves `true` for Discard. Escape answers Discard here (a second Escape leaves the
   * form, the usual intent), and a line below the question says so ("Press Esc to discard them.", only
   * with a keyboard); the close button and Enter answer Keep editing.
   */
  askDiscard(): Promise<boolean>;
}

/**
 * A question asked in the form dialog itself (`attempt.ask()`): for a moment the dialog
 * shrinks to the message and two buttons in place of its content ("Discard your changes?",
 * "Overwrite the existing file?"). No second dialog on top. Resolves `true` for the
 * confirm button, `false` for the other one, Escape or the close button; `false` too
 * when the dialog goes away meanwhile. The form is hidden, not removed, so nothing typed
 * is lost.
 */
export interface FormAskOptions {
  /** The confirming button's text. Default: the dialog's "OK". */
  confirm?: string;
  /** The other button's text. Default: the dialog's "Cancel". */
  cancel?: string;
  /** A critical question (e.g. "Discard"): the confirming button in the danger style. Default `false`. */
  critical?: boolean;
  /**
   * The header shows this title (and a question icon) instead of the dialog's own while
   * the question is asked. Without it only the icon is replaced.
   */
  title?: string;
}

/**
 * A question with any number of answers (`attempt.ask(message, { choices })`), e.g. Save,
 * Discard and Keep editing. The buttons are in the order of the keys, the first one in
 * the primary style; the last one is the safe answer: it has the focus, and Escape and
 * the close button answer it. Resolves the id of the chosen one.
 *
 * ```ts
 * const answer = await attempt.ask("Save your changes?", {
 *   choices: { save: "Save", discard: { text: "Discard", critical: true }, keep: "Keep editing" },
 * }); // "save" | "discard" | "keep"
 * ```
 */
export interface FormAskChoicesOptions<K extends string> {
  /** The answers by id: the button's text, or `critical` for the danger style. At least two. */
  choices: Record<K, string | { text: string; critical?: boolean }>;
  /** The header title in place of the dialog's own (see {@link FormAskOptions.title}). */
  title?: string;
}

/**
 * A request to close a form dialog (Cancel, Escape or the close button), handed to the loop
 * with {@link FormDialogConfig.guardClose}. Until it is answered, further requests to close
 * are dropped; a submit still works.
 */
export interface FormCloseAttempt {
  readonly kind: "close";
  /** Close the dialog: it resolves `{ canceled: true, aborted: false }`. */
  accept(): void;
  /** Keep it open, with everything typed. Shows nothing. */
  reject(): void;
  /**
   * Ask in place of the dialog's content before deciding, e.g.
   * `(await attempt.ask("Discard your changes?", { confirm: "Discard", critical: true })) ? attempt.accept() : attempt.reject()`.
   */
  ask(message: string, options?: FormAskOptions): Promise<boolean>;
  /** Ask with more than two answers (see {@link FormAskChoicesOptions}): resolves the id of the chosen one. */
  ask<K extends string>(message: string, options: FormAskChoicesOptions<K>): Promise<K>;
  /**
   * Ask "Discard your changes?" in place of the content, with the dialog's own texts
   * (translated): `askDiscard()` is `ask()` with the library's discard question, its
   * Discard (critical) and Keep editing buttons and the title "Unsaved changes".
   * Resolves `true` for Discard. Escape answers Discard here (a second Escape leaves the
   * form, the usual intent), and a line below the question says so ("Press Esc to discard them.", only
   * with a keyboard); the close button and Enter answer Keep editing.
   */
  askDiscard(): Promise<boolean>;
}

/**
 * What every dialog method returns: awaitable for the result, and a handle on the dialog
 * while it is up.
 *
 * `PromiseLike` rather than `Promise` on purpose — the contract is only "you can await
 * this", which leaves the implementation free to be a plain object instead of a real
 * promise with properties bolted on. A dialog never rejects: cancelling and aborting are
 * results, not errors, so there is no `catch` to promise.
 */
export interface DialogHandle<R, C extends object> extends PromiseLike<R> {
  /** True while the dialog can still be answered. Goes false the moment it settles. */
  readonly pending: boolean;
  /**
   * Take the dialog away and settle it as `{ canceled: true, aborted: true }` — the
   * imperative twin of {@link DialogConfig.abortSignal}. No-op once settled.
   */
  abort(): void;
  /**
   * Re-render the open dialog with patched view config — a new title, relabelled buttons,
   * different content. Omitted fields keep their current value.
   *
   * Only {@link DialogViewConfig} fields are accepted: behavioural options live one level
   * down (`abortSignal`, `validator`) and are fixed once the dialog is open. A slot whose
   * value is unchanged is not re-projected, so relabelling a button cannot disturb the
   * caller's content or anything the user has typed into it. No-op once settled.
   */
  update(patch: Partial<DialogViewConfig<C>>): void;
}

/**
 * A form dialog's handle: everything {@link DialogHandle} has, plus async iteration over
 * submit attempts. `for await` it to intercept each submit and accept/reject (retry with
 * a note); await it for the final result once the loop ends.
 */
export type FormDialogHandle<
  C extends object,
  A extends string = never,
  T extends FormAttempt<string> | FormCloseAttempt = FormAttempt<A>,
> = DialogHandle<FormDialogResult<A>, C> & AsyncIterable<T>;

// -------------------------------------------------------------------
// # Not part of the reviewed surface
//
// Everything above was gone through type by type against the types2.ts draft. What
// follows was not — it predates that pass, or is plumbing the draft deliberately left
// out. Treat it as unreviewed: it works, but nobody has argued for its shape.
// -------------------------------------------------------------------

/**
 * Any result the plumbing can produce, before narrowing to a specific dialog's.
 *
 * Only exists because one code path in the controller builds results for all ten
 * dialog kinds and TypeScript cannot follow which one it is at runtime. The draft dropped
 * it: `MessageDialogResult | ConfirmDialogResult | DecideDialogResult | FormDialogResult`
 * says the same thing more precisely and needs no declaration of its own.
 */
export type AnyDialogResult = Answered<string, unknown> | Dismissed | Aborted;
