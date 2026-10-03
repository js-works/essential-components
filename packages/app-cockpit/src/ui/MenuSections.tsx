import { Menu } from '@base-ui/react/menu';
import { Fragment } from 'react';
import type { ReactElement } from 'react';
import type { MenuItem } from '../api';

export { MenuSections };

// The entries of a menu of the host (the kebab's, the user's): sections, with a line between them; each entry with its
// icon (or the space of one), its label and its shortcut.
function MenuSections({ sections }: { sections: readonly (readonly MenuItem[])[] }): ReactElement {
  return (
    <>
      {sections.filter((section) => section.length > 0).map((section, index) => (
        <Fragment key={index}>
          {index > 0 && <Menu.Separator className="menu-separator" />}
          {section.map((item) => (
            <Menu.Item key={item.id} className="menu-item" onClick={item.onSelect}>
              {item.icon === undefined
                ? <span className="menu-icon" aria-hidden="true" />
                : <span className="menu-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: item.icon }} />}
              <span className="menu-label">{item.label}</span>
              {item.shortcut !== undefined && <kbd className="key">{item.shortcut}</kbd>}
            </Menu.Item>
          ))}
        </Fragment>
      ))}
    </>
  );
}
