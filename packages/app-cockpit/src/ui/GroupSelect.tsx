import { Select } from '@base-ui/react/select';
import type { ReactElement } from 'react';
import type { Group } from '../core/search';
import { GroupIcon } from './AppIcon';
import { CheckIcon, SelectorIcon } from './icons';

export { GroupSelect };

// The switch between the groups of apps (`groupDisplay: 'select'`), at the top of the navigation: the sidebar lists
// the apps of the chosen group only.
function GroupSelect({ groups, value, labelOf, iconOf, label, portal, onChange }: {
  groups: readonly Group[];
  value: string;
  labelOf: (group: Group) => string;
  iconOf: (group: Group) => string | undefined;
  label: string;
  portal: HTMLElement;
  onChange: (value: string) => void;
}): ReactElement {
  const current = groups.find((group) => group.name === value);
  // Icons only when some group has one (then every row keeps the space, so the names stay aligned).
  const icons = groups.some((group) => iconOf(group) !== undefined);

  return (
    <Select.Root
      value={value}
      onValueChange={(next) => {
        if (next !== null) {
          onChange(next);
        }
      }}
      items={groups.map((group) => ({ value: group.name, label: labelOf(group) }))}
    >
      <Select.Trigger className="group-select" aria-label={label}>
        {icons && current !== undefined && <GroupIcon icon={iconOf(current)} />}
        <Select.Value className="group-select-value" />
        {current !== undefined && <span className="group-count">{current.apps.length}</span>}
        <Select.Icon className="group-select-icon">
          <SelectorIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal container={portal}>
        <Select.Positioner className="select-positioner" sideOffset={4} alignItemWithTrigger={false}>
          <Select.Popup className="select-popup">
            <Select.List className="select-list">
              {groups.map((group) => (
                <Select.Item key={group.name} value={group.name} className="select-item">
                  <Select.ItemIndicator className="select-indicator">
                    <CheckIcon />
                  </Select.ItemIndicator>
                  {icons && <GroupIcon icon={iconOf(group)} />}
                  <Select.ItemText className="select-item-text">{labelOf(group)}</Select.ItemText>
                  <span className="select-item-count">{group.apps.length}</span>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
