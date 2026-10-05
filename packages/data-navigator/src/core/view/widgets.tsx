import { Menu as BaseMenu } from '@base-ui/react/menu';
import { Select as BaseSelect } from '@base-ui/react/select';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { useContext, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEventHandler, ReactElement, ReactNode } from 'react';
import type { DataNavigatorComponent as Spec } from '../../react/api';
import { flag, hasContent, isShiftClick } from '../utils';
import * as styles from './DataNavigator.module.css';
import { icons } from './icons';
import { LayerContext } from './layer';

export {
  ActionButton,
  ActionMenu,
  Checkbox,
  ChevronButton,
  ClearButton,
  FilterSelectField,
  FilterTextField,
  LoadingBar,
  PageButton,
  PagerButton,
  PageSizeField,
  Pill,
  PrefixedTextField,
  Radio,
  SearchField,
  Segmented,
  SelectInput,
  SortButton,
  TextButton,
  ToggleMenu,
  WithTip,
};
export type { ButtonPlacement, MenuEntry, Option, ToggleEntry };

// The widgets of the data navigator: native elements with the classes of our stylesheet. They know nothing about rows,
// queries or the state of the table. Selects, menus and tooltips come from Base UI.

type Option = { value: string; label: string };

// Where a button sits. The actions of the toolbar are the standard buttons (outlined, or filled for primary and
// danger), its view controls (`tool`: filter, reload) are ghost buttons, the buttons in a row are link-like and smaller.
type ButtonPlacement = 'toolbar' | 'tool' | 'row';

// One entry of an open action menu. The row is already bound, so `onClick` takes no argument.
type MenuEntry =
  | { type: 'separator'; key: string }
  | {
    type: 'action';
    key: string;
    label: ReactNode;
    icon: ReactNode;
    variant: Spec.ActionVariant;
    onClick: () => void;
  };

const pagerIcons = {
  previous: icons.ChevronLeft,
  next: icons.ChevronRight,
} as const;

// The tooltip of a trigger (Base UI's Tooltip): shown on hover (after the delay of the provider at the root) and on
// keyboard focus, hidden on leave, blur, Escape and click. The trigger element itself is ours: Base UI renders it
// through `render` and adds its handlers. Without a tip, the trigger is returned as it is. The popup is rendered into
// the layer of the root, so it gets the tokens of the theme.
// Base UI's tooltip is visual only (no aria-describedby). So with `describe`, the trigger carries the tip as its
// `aria-description`, for triggers whose name is not the tip already (a button with a label, a sortable header).
// `offset`: the gap to the trigger in pixels (4 by default).
type WithTipProps = {
  tip: string | undefined;
  describe: boolean;
  disabled?: boolean;
  offset?: number;
  children: ReactElement;
};

function WithTip({ tip, describe, disabled = false, offset = 4, children }: WithTipProps): ReactElement {
  const layer = useContext(LayerContext);

  if (tip === undefined) {
    return children;
  }

  return (
    <BaseTooltip.Root disabled={disabled}>
      <BaseTooltip.Trigger render={children} aria-description={describe ? tip : undefined} />
      <BaseTooltip.Portal container={layer}>
        <BaseTooltip.Positioner
          className={styles.tooltipPositioner}
          side="top"
          sideOffset={offset}
          positionMethod="fixed"
        >
          <BaseTooltip.Popup className={styles.tooltip}>{tip}</BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

function Pill({ children }: { children: ReactNode }): ReactElement {
  return <span className={styles.pill}>{children}</span>;
}

// A quiet button that looks like a link: Reset, Clear all, Cancel.
function TextButton(props: { children: ReactNode; muted?: boolean; onClick: () => void }): ReactElement {
  const { children, muted = false, onClick } = props;

  return (
    <button type="button" className={styles.textButton} data-muted={flag(muted)} onClick={onClick}>
      {children}
    </button>
  );
}

type SegmentedProps<V extends string> = {
  value: V;
  options: readonly { value: V; label: string }[];
  // The accessible name of the group: a label of its own, or the id of an element that names it.
  label?: string;
  labelledBy?: string;
  small?: boolean;
  onChange: (value: V) => void;
};

// A row of connected buttons of which exactly one is chosen (a radio group).
function Segmented<V extends string>(props: SegmentedProps<V>): ReactElement {
  const { value, options, label, labelledBy, small = false, onChange } = props;

  return (
    <div
      role="radiogroup"
      className={styles.segmented}
      data-small={flag(small)}
      aria-label={label}
      aria-labelledby={labelledBy}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          className={styles.segment}
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// The loading indicator: a thin gray bar with a sliding segment (no spinner).
function LoadingBar({ label }: { label: string }): ReactElement {
  return <span role="status" aria-label={label} className={styles.loadingBar} />;
}

type CheckboxProps = {
  label: string;
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  // `shift` comes from the native click event and drives the block selection.
  onChange: (checked: boolean, shift: boolean) => void;
};

function Checkbox({ label, checked, indeterminate = false, disabled, onChange }: CheckboxProps): ReactElement {
  const ref = useRef<HTMLInputElement>(null);

  // `indeterminate` is a property only, there is no attribute for it.
  useLayoutEffect(() => {
    if (ref.current !== null) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className={styles.check}
      aria-label={label}
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.currentTarget.checked, isShiftClick(event.nativeEvent))}
    />
  );
}

function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }): ReactElement {
  return <input type="radio" className={styles.check} aria-label={label} checked={checked} onChange={onChange} />;
}

// The details toggle. The chevron points right when collapsed and turns down (animated) when expanded.
function ChevronButton(props: { label: string; expanded: boolean; onClick: () => void }): ReactElement {
  const { label, expanded, onClick } = props;

  return (
    <button type="button" className={styles.detailToggle} aria-label={label} aria-expanded={expanded} onClick={onClick}>
      <span className={styles.chevron} data-expanded={flag(expanded)}>
        <icons.ChevronRight />
      </span>
    </button>
  );
}

type PagerButtonProps = {
  icon: keyof typeof pagerIcons;
  label: string;
  disabled: boolean;
  onClick: () => void;
};

function PagerButton({ icon, label, disabled, onClick }: PagerButtonProps): ReactElement {
  const Icon = pagerIcons[icon];

  return (
    <button
      type="button"
      className={`${styles.iconButton} ${styles.pagerButton}`}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon />
    </button>
  );
}

// A page number of the pager. The current page is marked (`aria-current`, a light accent tint) and does nothing.
// `width`: its least width (the one every slot of the pager gets, see `Footer`). `pending`: its page is being loaded (a
// turning ring around it, `data-pending`).
function PageButton(
  { page, label, current, pending = false, width, onClick }: {
    page: number;
    label: string;
    current: boolean;
    pending?: boolean;
    width: string;
    onClick: () => void;
  },
): ReactElement {
  return (
    <button
      type="button"
      className={styles.pageButton}
      data-pending={flag(pending)}
      style={{ minWidth: width }}
      aria-label={label}
      aria-current={current ? 'page' : undefined}
      onClick={current ? undefined : onClick}
    >
      {page}
    </button>
  );
}

// A sortable column header. The whole header cell around it handles the click, so it has no onClick of its own.
// Without a direction the column is not sorted, and its icon is faint (the stylesheet does that).
function SortButton(
  props: { tip: string; header: ReactNode; direction: Spec.SortDirection | undefined },
): ReactElement {
  const { tip, header, direction } = props;
  const icon = direction === undefined
    ? <icons.ArrowsVertical size={14} className={styles.unsortedIcon} />
    : direction === 'asc'
    ? <icons.ArrowUp size={14} />
    : <icons.ArrowDown size={14} />;

  return (
    // The tooltip is anchored to the header text, so it keeps a bigger gap: it sits above the whole header cell (its
    // padding and the rounded hover shape), not over it.
    <WithTip tip={tip} describe offset={12}>
      <button type="button" className={styles.sortButton}>
        <span className={styles.headerText}>{header}</span>
        {icon}
      </button>
    </WithTip>
  );
}

type ActionButtonProps = {
  look: Spec.ActionLook;
  variant: Spec.ActionVariant;
  placement: ButtonPlacement;
  busy?: boolean;
  onClick: () => void;
};

// The inside of an action button: the icon in front, then the label. Without a label it is an icon-only button, whose
// accessible name is the tip.
function buttonContent(look: Spec.ActionLook, chevron: boolean): ReactNode {
  return (
    <>
      {hasContent(look.icon) && <span className={styles.buttonIcon}>{look.icon}</span>}
      {look.label !== undefined && <span className={styles.buttonLabel}>{look.label}</span>}
      {chevron && look.label !== undefined && <icons.ChevronDown size={14} />}
    </>
  );
}

function buttonAttributes(look: Spec.ActionLook, variant: Spec.ActionVariant, placement: ButtonPlacement) {
  return {
    type: 'button',
    className: styles.button,
    'aria-label': look.label === undefined ? look.tip : undefined,
    'data-variant': variant,
    'data-placement': placement,
    'data-icon-only': flag(look.label === undefined),
  } as const;
}

// `busy`: something is running (the Reload button while loading): its icon turns.
function ActionButton({ look, variant, placement, busy = false, onClick }: ActionButtonProps): ReactElement {
  return (
    <WithTip tip={look.tip} describe={look.label !== undefined}>
      <button {...buttonAttributes(look, variant, placement)} data-busy={flag(busy)} onClick={onClick}>
        {buttonContent(look, false)}
      </button>
    </WithTip>
  );
}

type ActionMenuProps = Omit<ActionButtonProps, 'onClick' | 'busy'> & { entries: readonly MenuEntry[] };

// A button with a flat list of actions (Base UI's Menu): arrow keys, Home, End and typing move between the items,
// Enter chooses one, Escape and a click outside close it, and the focus goes back to the button. The list opens below
// the button, aligned to its end (the actions of the toolbar and the action column both sit at the right), so it does
// not reach past the table. It is rendered in the layer of the root (so it gets the tokens of the theme). It is not modal. The
// tooltip of the button is disabled while the menu is open.
function ActionMenu({ look, variant, placement, entries }: ActionMenuProps): ReactElement {
  const layer = useContext(LayerContext);
  const [open, setOpen] = useState(false);
  const withIcons = entries.some((entry) => entry.type !== 'separator' && hasContent(entry.icon));

  return (
    <BaseMenu.Root modal={false} open={open} onOpenChange={setOpen}>
      <WithTip tip={look.tip} describe={look.label !== undefined} disabled={open}>
        <BaseMenu.Trigger {...buttonAttributes(look, variant, placement)}>
          {buttonContent(look, true)}
        </BaseMenu.Trigger>
      </WithTip>
      <BaseMenu.Portal container={layer}>
        <BaseMenu.Positioner
          className={styles.popupPositioner}
          side="bottom"
          align="end"
          sideOffset={4}
          positionMethod="fixed"
        >
          {/* With icons (at least one entry has one), every entry gets the icon's place, so the texts line up. */}
          <BaseMenu.Popup className={withIcons ? `${styles.popup} ${styles.menuWithIcons}` : styles.popup}>
            {entries.map((entry) =>
              entry.type === 'separator'
                ? <BaseMenu.Separator key={entry.key} className={styles.menuSeparator} />
                : (
                  <BaseMenu.Item
                    key={entry.key}
                    className={styles.menuItem}
                    data-variant={entry.variant}
                    onClick={entry.onClick}
                  >
                    {withIcons && <span className={styles.menuIcon}>{entry.icon}</span>}
                    <span className={styles.menuText}>{entry.label}</span>
                  </BaseMenu.Item>
                )
            )}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

// One entry of a toggle menu: something that is on or off (a column that is shown or hidden).
type ToggleEntry = { key: string; label: ReactNode; checked: boolean; disabled: boolean };

// One action of a toggle menu, above its entries: a plain item that closes the menu.
type ToggleAction = { key: string; label: string; icon: ReactNode; disabled: boolean; onSelect: () => void };

// One choice of a toggle menu, at its top: a labeled group of radio items (e.g. the layout of the table).
type ToggleChoice = {
  label: string;
  value: string;
  options: readonly Option[];
  onChange: (value: string) => void;
};

type ToggleMenuProps = {
  icon: ReactNode;
  // The accessible name and the tooltip of the icon-only button.
  label: string;
  // At the top, with a separator after it.
  choice?: ToggleChoice;
  // Above the entries, with a separator between them (none without entries).
  actions?: readonly ToggleAction[];
  entries: readonly ToggleEntry[];
  onToggle: (key: string, checked: boolean) => void;
};

// An icon-only ghost button with a menu of checkbox items (Base UI's Menu.CheckboxItem), e.g. the columns to show. The
// menu stays open while its items are toggled or chosen (Escape or a click outside closes it). Every item shows a
// checkbox in front, only as a picture of its state (like the options of a multiple select). It opens below the button,
// aligned to its end. A choice (radio items with a check at the chosen one, under its label) comes first, then the
// actions (plain items), then the entries, with separators between them.
function ToggleMenu({ icon, label, choice, actions = [], entries, onToggle }: ToggleMenuProps): ReactElement {
  const layer = useContext(LayerContext);
  const [open, setOpen] = useState(false);
  const look: Spec.ActionLook = { icon, tip: label };

  return (
    <BaseMenu.Root modal={false} open={open} onOpenChange={setOpen}>
      <WithTip tip={label} describe={false} disabled={open}>
        <BaseMenu.Trigger {...buttonAttributes(look, 'secondary', 'tool')}>
          {buttonContent(look, false)}
        </BaseMenu.Trigger>
      </WithTip>
      <BaseMenu.Portal container={layer}>
        <BaseMenu.Positioner
          className={styles.popupPositioner}
          side="bottom"
          align="end"
          sideOffset={4}
          positionMethod="fixed"
        >
          <BaseMenu.Popup className={`${styles.popup} ${styles.menuWithIcons}`}>
            {choice !== undefined && (
              <>
                <BaseMenu.Group className={styles.menuGroup}>
                  <BaseMenu.GroupLabel className={styles.menuGroupLabel}>{choice.label}</BaseMenu.GroupLabel>
                  <BaseMenu.RadioGroup
                    className={styles.menuGroup}
                    value={choice.value}
                    onValueChange={(value: string) => choice.onChange(value)}
                  >
                    {choice.options.map((option) => (
                      <BaseMenu.RadioItem
                        key={option.value}
                        value={option.value}
                        className={styles.menuItem}
                        closeOnClick={false}
                      >
                        <span className={styles.menuIcon}>
                          <span className={styles.selectCheck}>
                            <BaseMenu.RadioItemIndicator>
                              <icons.Check size={14} />
                            </BaseMenu.RadioItemIndicator>
                          </span>
                        </span>
                        <span className={styles.menuText}>{option.label}</span>
                      </BaseMenu.RadioItem>
                    ))}
                  </BaseMenu.RadioGroup>
                </BaseMenu.Group>
                {(actions.length > 0 || entries.length > 0) && <BaseMenu.Separator className={styles.menuSeparator} />}
              </>
            )}
            {actions.map((action) => (
              <BaseMenu.Item
                key={action.key}
                className={styles.menuItem}
                disabled={action.disabled}
                onClick={action.onSelect}
              >
                <span className={styles.menuIcon}>{action.icon}</span>
                <span className={styles.menuText}>{action.label}</span>
              </BaseMenu.Item>
            ))}
            {actions.length > 0 && entries.length > 0 && <BaseMenu.Separator className={styles.menuSeparator} />}
            {entries.map((entry) => (
              <BaseMenu.CheckboxItem
                key={entry.key}
                className={styles.menuItem}
                checked={entry.checked}
                disabled={entry.disabled}
                closeOnClick={false}
                onCheckedChange={(checked) => onToggle(entry.key, checked)}
              >
                <span className={styles.menuIcon}>
                  <input
                    type="checkbox"
                    className={styles.check}
                    checked={entry.checked}
                    readOnly
                    tabIndex={-1}
                    aria-hidden
                  />
                </span>
                <span className={styles.menuText}>{entry.label}</span>
              </BaseMenu.CheckboxItem>
            ))}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

function ClearButton({ label, onClick }: { label: string; onClick: () => void }): ReactElement {
  return (
    <button type="button" className={styles.clearButton} aria-label={label} onClick={onClick}>
      <icons.Close size={14} />
    </button>
  );
}

type SearchFieldProps = {
  value: string;
  // The accessible name and the placeholder.
  label: string;
  clearLabel: string;
  onChange: (text: string) => void;
  onClear: () => void;
  onKeyDown: KeyboardEventHandler;
  // Not usable for now (e.g. while the filter view is shown).
  inert?: boolean;
};

function SearchField(props: SearchFieldProps): ReactElement {
  const { value, label, clearLabel, onChange, onClear, onKeyDown, inert = false } = props;

  return (
    <div className={styles.searchField} inert={inert}>
      <span className={styles.fieldIcon}>
        <icons.Search />
      </span>
      <input
        type="text"
        className={styles.input}
        aria-label={label}
        placeholder={label}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        onKeyDown={onKeyDown}
      />
      {value !== '' && <ClearButton label={clearLabel} onClick={onClear} />}
    </div>
  );
}

type PageSizeFieldProps = {
  value: string;
  // The name of the group of sizes ("Page Size"), and the text of the button ("10 items per page"), its name and the menu's.
  label: string;
  text: string;
  // A new page size is being loaded: a small turning spinner in place of the chevron.
  pending?: boolean;
  options: readonly Option[];
  onChange: (value: string) => void;
};

// The page size of the footer (2026-10-05; an outlined select with a label before it until then): a ghost button with
// the size as text and a chevron, like the view controls of the toolbar, so it does not look like a form field (which
// never matched the selects of the app's UI library). It opens a menu in the look of the other menus (the context menu,
// the column menu's layout): the sizes one below the other, a check at the current one (Base UI's `Menu` with radio
// items). Above the button (the footer is at the bottom), aligned to its end; another size closes it, the current one
// changes nothing and keeps it open.
function PageSizeField({ value, label, text, pending = false, options, onChange }: PageSizeFieldProps): ReactElement {
  const layer = useContext(LayerContext);

  return (
    <BaseMenu.Root modal={false}>
      <BaseMenu.Trigger
        className={`${styles.button} ${styles.pageSizeButton}`}
        data-placement="tool"
        data-pending={flag(pending)}
      >
        <span>{text}</span>
        {pending ? <span className={styles.pendingSpinner} aria-hidden="true" /> : <icons.ChevronDown size={14} />}
      </BaseMenu.Trigger>
      <BaseMenu.Portal container={layer}>
        <BaseMenu.Positioner
          className={styles.popupPositioner}
          side="top"
          align="end"
          sideOffset={4}
          positionMethod="fixed"
        >
          {/* The menu is named by its button (Base UI), the group of sizes by `label`. */}
          <BaseMenu.Popup className={`${styles.popup} ${styles.menuWithIcons}`}>
            <BaseMenu.RadioGroup
              aria-label={label}
              className={styles.menuGroup}
              value={value}
              // Base UI reports a click on the current size as a change too: that one changes nothing.
              onValueChange={(next: string) => next !== value && onChange(next)}
            >
              {options.map((option) => (
                <BaseMenu.RadioItem
                  key={option.value}
                  value={option.value}
                  className={`${styles.menuItem} ${styles.pageSizeItem}`}
                  // The current size changes nothing: the menu stays open.
                  closeOnClick={option.value !== value}
                >
                  <span className={styles.menuIcon}>
                    <span className={styles.selectCheck}>
                      <BaseMenu.RadioItemIndicator>
                        <icons.Check size={14} />
                      </BaseMenu.RadioItemIndicator>
                    </span>
                  </span>
                  <span className={styles.menuText}>{option.label}</span>
                </BaseMenu.RadioItem>
              ))}
            </BaseMenu.RadioGroup>
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

type PrefixedTextFieldProps = FilterTextFieldProps & {
  prefix: { value: string; label: string; options: readonly Option[]; onChange: (value: string) => void };
};

// A text field with a small select inside it, at its start, as a chip (e.g. how a text filter matches: contains,
// starts with, ends with). The select is one of ours (`SelectField`), with its chevron.
function PrefixedTextField({ prefix, ...field }: PrefixedTextFieldProps): ReactElement {
  return (
    <div className={styles.prefixedField}>
      <div className={styles.prefixSelect}>
        <SelectField
          value={[prefix.value]}
          multiple={false}
          options={prefix.options}
          naming={{ 'aria-label': prefix.label }}
          onChange={(next) => next[0] !== undefined && prefix.onChange(next[0])}
        />
        <span className={styles.fieldEnd}>
          <icons.ChevronDown size={14} />
        </span>
      </div>
      <FilterTextField {...field} />
    </div>
  );
}

type FilterTextFieldProps = {
  value: string;
  placeholder: string;
  labelledBy: string;
  clearLabel: string;
  onChange: (text: string) => void;
  onClear: () => void;
  onKeyDown?: KeyboardEventHandler;
};

function FilterTextField(props: FilterTextFieldProps): ReactElement {
  const { value, placeholder, labelledBy, clearLabel, onChange, onClear, onKeyDown } = props;

  return (
    <div className={styles.field}>
      <input
        type="text"
        className={styles.input}
        aria-labelledby={labelledBy}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        onKeyDown={onKeyDown}
      />
      {value !== '' && <ClearButton label={clearLabel} onClick={onClear} />}
    </div>
  );
}

type FilterSelectFieldProps = {
  value: readonly string[];
  // Shown while nothing is selected. In a single select it is also the option that selects nothing.
  placeholder: string;
  labelledBy: string;
  clearLabel: string;
  multiple: boolean;
  options: readonly Option[];
  onChange: (value: readonly string[]) => void;
};

// A select of Base UI, for a single and for a multiple select. The value is a list of none, one or several option
// values, whatever the mode. Both show a clear button while something is selected, before their arrow (which is always
// there, and turns while the list is open). A single select also has an option for "nothing" (the placeholder, value
// ''), so it can be cleared from its list as well.
function FilterSelectField(props: FilterSelectFieldProps): ReactElement {
  const { value, placeholder, labelledBy, clearLabel, multiple, options, onChange } = props;

  return (
    <div className={`${styles.field} ${styles.listField}`}>
      <SelectField
        value={value}
        multiple={multiple}
        options={multiple ? options : [{ value: '', label: placeholder }, ...options]}
        placeholder={placeholder}
        naming={{ 'aria-labelledby': labelledBy }}
        onChange={(next) => onChange(next.filter((item) => item !== ''))}
      />
      {value.length > 0 && <ClearButton label={clearLabel} onClick={() => onChange([])} />}
      <span className={styles.fieldEnd}>
        <icons.ChevronDown size={14} />
      </span>
    </div>
  );
}

type SelectInputProps = {
  value: string;
  options: readonly Option[];
  labelledBy: string;
  onChange: (value: string) => void;
};

// A single select that always has a value (e.g. an editor of a row): the look of the other selects, with its chevron,
// and no clear button.
function SelectInput({ value, options, labelledBy, onChange }: SelectInputProps): ReactElement {
  return (
    <div className={styles.field}>
      <SelectField
        value={[value]}
        multiple={false}
        options={options}
        naming={{ 'aria-labelledby': labelledBy }}
        onChange={(next) => next[0] !== undefined && onChange(next[0])}
      />
      <span className={styles.fieldEnd}>
        <icons.ChevronDown size={14} />
      </span>
    </div>
  );
}

type SelectFieldProps = {
  value: readonly string[];
  multiple: boolean;
  options: readonly Option[];
  placeholder?: string;
  // The accessible name of the trigger: a label of its own, or the id of an element that names it.
  naming: { 'aria-label': string } | { 'aria-labelledby': string };
  onChange: (value: readonly string[]) => void;
};

// The trigger looks like our text inputs. The list opens below it (not over it, as Base UI does by default), in the
// look of our menus: a single select with a checkmark in front of the chosen option, a multiple select with a checkbox
// in front of every option. It is rendered into the layer of the root, so it gets the
// tokens of the theme. It is not modal: the page stays usable while it is open.
function SelectField({ value, multiple, options, placeholder, naming, onChange }: SelectFieldProps): ReactElement {
  const layer = useContext(LayerContext);
  const chosen = value.filter((item) => item !== '');
  const labelOf = (item: string) => options.find((option) => option.value === item)?.label ?? item;

  // One root for both modes: its value is a list with `multiple`, a single value (or null) without.
  return (
    <BaseSelect.Root<string, boolean>
      multiple={multiple}
      modal={false}
      value={multiple ? chosen : value[0] ?? ''}
      onValueChange={(next) => onChange(Array.isArray(next) ? next : next === null ? [] : [next])}
    >
      <BaseSelect.Trigger
        className={`${styles.input} ${styles.select}`}
        data-empty={flag(chosen.length === 0)}
        {...naming}
      >
        <BaseSelect.Value className={styles.selectText}>
          {() => (chosen.length === 0 ? placeholder : chosen.map(labelOf).join(', '))}
        </BaseSelect.Value>
      </BaseSelect.Trigger>
      <BaseSelect.Portal container={layer}>
        <BaseSelect.Positioner
          className={styles.popupPositioner}
          alignItemWithTrigger={false}
          align="start"
          sideOffset={4}
          positionMethod="fixed"
        >
          <BaseSelect.Popup className={styles.popup}>
            <BaseSelect.List>
              {options.map((option) => (
                <BaseSelect.Item key={option.value} value={option.value} className={styles.selectItem}>
                  <OptionMark multiple={multiple} checked={chosen.includes(option.value)} />
                  <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

// What an option shows in front of its label. A multiple select shows a checkbox, but only as a picture of the state:
// the option is the control, so the checkbox is hidden from assistive technology and takes no clicks or focus. A
// single select shows a checkmark at the chosen option, and keeps its room on every option, so the labels line up.
function OptionMark({ multiple, checked }: { multiple: boolean; checked: boolean }): ReactElement {
  return multiple
    ? <input type="checkbox" className={styles.check} checked={checked} readOnly tabIndex={-1} aria-hidden />
    : (
      <span className={styles.selectCheck}>
        <BaseSelect.ItemIndicator>
          <icons.Check size={14} />
        </BaseSelect.ItemIndicator>
      </span>
    );
}
