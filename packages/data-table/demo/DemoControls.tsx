import type { ReactElement } from 'react';
import type { Controls } from './controls';

export { DemoControls };

type Choice<Value extends string> = {
  label: string;
  value: Value;
  options: readonly (readonly [Value, string])[];
  onChange: (value: Value) => void;
};

// A labelled native select. The options are the only values it can report, so the cast is safe.
function Select<Value extends string>({ label, value, options, onChange }: Choice<Value>): ReactElement {
  return (
    <label className="ui-field">
      {label}
      <select className="ui-select" value={value} onChange={(event) => onChange(event.currentTarget.value as Value)}>
        {options.map(([option, text]) => <option key={option} value={option}>{text}</option>)}
      </select>
    </label>
  );
}

// The settings of the component, as plain native selects (no UI library), styled by the design language (`ui/ui.css`).
// The global ones (language, color scheme) belong to the page, not to the demo.
function DemoControls({ controls }: { controls: Controls }): ReactElement {
  const same = <Value extends string>(...values: readonly Value[]) => values.map((value) => [value, value] as const);

  return (
    <div className="ui-toolbar">
      <Select
        label="Theme"
        value={controls.theme}
        options={[['default', 'Default'], ['soft', 'Soft'], ['mantine', 'Mantine'], ['antd', 'Ant Design']]}
        onChange={controls.setTheme}
      />
      <Select
        label="Actions"
        value={controls.actions}
        options={same('general', 'single-row', 'multi-row')}
        onChange={controls.setActions}
      />
      <Select
        label="Action variants"
        value={controls.variants}
        options={same('off', 'on')}
        onChange={controls.setVariants}
      />
      <Select
        label="Data"
        value={controls.data}
        options={same('users', 'empty', 'custom')}
        onChange={controls.setData}
      />
      <Select
        label="Filters"
        value={controls.filters}
        options={same('off', 'on')}
        onChange={controls.setFilters}
      />
      <Select
        label="Columns"
        value={controls.columns}
        options={same('flat', 'grouped')}
        onChange={controls.setColumns}
      />
      <Select
        label="Selection color"
        value={controls.selectionAppearance}
        options={same('neutral', 'accent')}
        onChange={controls.setSelectionAppearance}
      />
      <Select
        label="Row actions"
        value={controls.rowActionLook}
        options={[['icon', 'Icon'], ['label', 'Label'], ['iconAndLabel', 'Icon and label']]}
        onChange={controls.setRowActionLook}
      />
      <Select
        label="Density"
        value={controls.density}
        options={same('compact', 'normal', 'comfortable')}
        onChange={controls.setDensity}
      />
      <Select
        label="Layout"
        value={controls.layout}
        options={[['user', 'User chooses'], ['auto', 'Automatic'], ['table', 'Table'], ['cards', 'Cards']]}
        onChange={controls.setLayout}
      />
      <Select
        label="Footer"
        value={controls.footer}
        options={same('always', 'auto', 'never')}
        onChange={controls.setFooter}
      />
      <Select
        label="Striped"
        value={controls.striped}
        options={same('off', 'on')}
        onChange={controls.setStriped}
      />
      <Select
        label="Height"
        value={controls.height}
        options={same('auto', 'fixed')}
        onChange={controls.setHeight}
      />
    </div>
  );
}
