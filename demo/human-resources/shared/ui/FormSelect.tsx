import { Select } from '@mantine/core';
import type { SelectProps } from '@mantine/core';
import { useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { useTranslate } from '../lib/i18n';

export { FormSelect };

// The longer lists are searchable (typing narrows them).
const SEARCHABLE_FROM = 8;

// Mantine's `Select` for the forms in the dialogs (2026-10-08, the user's wish; native selects before): its popup in
// the dialog with a fixed position (no portal: the dialog is modal), like the date pickers and the Board Manager's
// `AsyncSelect`. A field without a value (`clearable`: "none", e.g. no manager) gives `undefined`, not Mantine's
// `null`, so the schema's default applies; a required one cannot be deselected. Escape closes the list first, then
// (again) the dialog.
function FormSelect({ clearable = false, onChange, data, ...props }: Omit<SelectProps, 'onChange'> & {
  onChange?: (value: string | undefined) => void;
}): ReactElement {
  const t = useTranslate();
  const searchable = Array.isArray(data) && data.length >= SEARCHABLE_FROM;
  // The field's width, measured when the list opens: the list is at least as wide.
  const fieldRef = useRef<HTMLInputElement>(null);
  const [fieldWidth, setFieldWidth] = useState<number | undefined>(undefined);

  return (
    <Select
      data={data}
      clearable={clearable}
      allowDeselect={clearable}
      searchable={searchable}
      nothingFoundMessage={t('common.nothingFound')}
      // The list as wide as its longest option, not the field (2026-10-10, the user's wish: in the two columns of the
      // employee's dialog the fields are narrow, and the options wrapped), from the field's start; Floating UI keeps it
      // inside the dialog. At least as wide as the field.
      comboboxProps={{ withinPortal: false, floatingStrategy: 'fixed', width: 'max-content', position: 'bottom-start' }}
      styles={{ dropdown: { minWidth: fieldWidth } }}
      ref={fieldRef}
      onChange={(value) => onChange?.(value ?? undefined)}
      {...props}
      onDropdownOpen={() => {
        setFieldWidth(fieldRef.current?.offsetWidth);
        props.onDropdownOpen?.();
      }}
      // Escape with the list open closes only the list, not the dialog (the native `<dialog>` closes on it).
      onKeyDown={(event) => {
        if (event.key === 'Escape' && event.currentTarget.getAttribute('aria-expanded') === 'true') {
          event.preventDefault();
          event.stopPropagation();
        }

        props.onKeyDown?.(event);
      }}
    />
  );
}
