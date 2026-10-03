import { Menu } from '@base-ui/react/menu';
import { useRef } from 'react';
import type { ReactElement } from 'react';
import type { MenuItem, User } from '../api';
import type { Texts } from '../core/texts';
import { initialsOf } from './AppIcon';
import { MenuSections } from './MenuSections';
import { WithTooltip } from './WithTooltip';

export { UserRow };

// The signed-in user, above the footer: the avatar (an image, else the initials), the name and a second line (e.g. the
// email). With a menu (`userMenu`), the row is a button that opens it to the right of the sidebar, touching it, its
// bottom at the row's; in the rail only the avatar (the name as its tooltip).
function UserRow({ user, menu, rail, texts, portal }: {
  user: User;
  menu: readonly (readonly MenuItem[])[];
  rail: boolean;
  texts: Texts;
  portal: HTMLElement;
}): ReactElement {
  const row = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const avatar = user.avatar === undefined
    ? <span className="avatar" aria-hidden="true">{initialsOf(user.name).toUpperCase()}</span>
    : <img className="avatar" src={user.avatar} alt="" />;
  const content = (
    <>
      {avatar}
      <span className="user-text">
        <span className="user-name">{user.name}</span>
        {user.detail !== undefined && <span className="user-detail">{user.detail}</span>}
      </span>
      {menu.length > 0 && (
        <svg className="icon icon--chevron-right" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m10 7 5 5-5 5" />
        </svg>
      )}
    </>
  );

  if (menu.length === 0) {
    return (
      <div ref={row} className="user-row">
        <WithTooltip label={user.name} enabled={rail} portal={portal}>
          <div className="user-button" aria-label={rail ? user.name : undefined}>{content}</div>
        </WithTooltip>
      </div>
    );
  }

  return (
    <div ref={row} className="user-row">
      <Menu.Root>
        <WithTooltip label={user.name} enabled={rail} portal={portal}>
          <Menu.Trigger ref={trigger} className="user-button" aria-label={`${texts.account}: ${user.name}`}>
            {content}
          </Menu.Trigger>
        </WithTooltip>
        <Menu.Portal container={portal}>
          <Menu.Positioner
            className="menu-positioner"
            side="right"
            align="end"
            // From the trigger's right edge to the row's (the sidebar's): the menu touches the sidebar.
            sideOffset={() =>
              (row.current?.getBoundingClientRect().right ?? 0) - (trigger.current?.getBoundingClientRect().right ?? 0)}
            collisionPadding={0}
          >
            <Menu.Popup className="menu-popup" data-flush>
              <MenuSections sections={menu} />
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}
