import { Menu } from '@base-ui/react/menu';
import { useRef, useState } from 'react';
import type { ReactElement, RefObject } from 'react';
import type { Action, Choices, Footer as Config } from '../api';
import type { Texts } from '../core/texts';
import { CheckIcon, KebabIcon, PanelIcon } from './icons';
import { MenuSections } from './MenuSections';
import { WithTooltip } from './WithTooltip';

export { Footer };

// The footer of the sidebar: a dark bar of segments. On the left the sidebar's toggle, in the middle the host's
// actions (icon buttons, `footer.actions`), on the right a kebab button with the host's menu (`footer.menu`, sections
// with separators between them). Its menus are plain panels in the sidebar's colors (square corners, a line where
// they touch): with the sidebar expanded a sheet on top of the footer, as wide as the sidebar; in the rail (where the
// segments are stacked) to the right, touching the sidebar, their bottom at their button's.
function Footer({ footer, rail, canToggle, texts, portal, onToggle }: {
  footer: Config;
  rail: boolean;
  canToggle: boolean;
  texts: Texts;
  portal: HTMLElement;
  onToggle: () => void;
}): ReactElement {
  const actions = footer.actions ?? [];
  const menu = (footer.menu ?? []).filter((section) => section.length > 0);
  const side = rail ? 'right' : 'top';
  // The footer bar: with the sidebar expanded, its menus open as a sheet on top of it, as wide as the sidebar.
  const bar = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={bar}
      className="footer"
      role="toolbar"
      aria-label={texts.footer}
      aria-orientation={rail ? 'vertical' : 'horizontal'}
    >
      {canToggle && (
        <WithTooltip label={rail ? texts.expand : texts.collapse} side={side} portal={portal}>
          <button
            type="button"
            className="footer-button footer-toggle"
            aria-label={rail ? texts.expand : texts.collapse}
            aria-expanded={!rail}
            onClick={onToggle}
          >
            <PanelIcon />
          </button>
        </WithTooltip>
      )}
      <div className="footer-actions">
        {actions.map((action) =>
          action.choices === undefined
            ? (
              <WithTooltip key={action.id} label={action.label} side={side} portal={portal}>
                <button type="button" className="footer-button" aria-label={action.label} onClick={action.onSelect}>
                  <ActionIcon icon={action.icon} badge={action.badge} />
                </button>
              </WithTooltip>
            )
            : (
              <ChoiceMenu
                key={action.id}
                action={action}
                choices={action.choices}
                side={side}
                bar={bar}
                portal={portal}
              />
            )
        )}
      </div>
      {menu.length > 0 && (
        <Menu.Root>
          <WithTooltip label={texts.more} side={side} portal={portal}>
            <Menu.Trigger className="footer-button footer-more" aria-label={texts.more}>
              <KebabIcon />
            </Menu.Trigger>
          </WithTooltip>
          <Menu.Portal container={portal}>
            <Menu.Positioner
              className="menu-positioner"
              {...(rail ? {} : { anchor: bar })}
              side={side}
              align={rail ? 'end' : 'start'}
              sideOffset={0}
              collisionPadding={0}
            >
              <Menu.Popup className="menu-popup" data-flush data-sheet={!rail || undefined}>
                <MenuSections sections={menu} />
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      )}
    </div>
  );
}

function ActionIcon({ icon, badge }: { icon: string; badge: boolean | undefined }): ReactElement {
  return (
    <>
      <span className="footer-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon }} />
      {badge === true && <span className="footer-badge" aria-hidden="true" />}
    </>
  );
}

// An action with choices (e.g. the language): its button opens a menu with the options, the current one checked. The
// value is read when the menu renders, so it is always the host's current one.
function ChoiceMenu({ action, choices, side, bar, portal }: {
  action: Action;
  choices: Choices;
  side: 'right' | 'top';
  bar: RefObject<HTMLDivElement | null>;
  portal: HTMLElement;
}): ReactElement {
  const [, setVersion] = useState(0);
  const current = choices.options.find((option) => option.value === choices.value());
  const label = current === undefined ? action.label : `${action.label}: ${current.label}`;

  return (
    <Menu.Root onOpenChange={() => setVersion((version) => version + 1)}>
      <WithTooltip label={label} side={side} portal={portal}>
        <Menu.Trigger className="footer-button" aria-label={label}>
          <ActionIcon icon={action.icon} badge={action.badge} />
        </Menu.Trigger>
      </WithTooltip>
      <Menu.Portal container={portal}>
        <Menu.Positioner
          className="menu-positioner"
          {...(side === 'right' ? {} : { anchor: bar })}
          side={side}
          align={side === 'right' ? 'end' : 'start'}
          sideOffset={0}
          collisionPadding={0}
        >
          <Menu.Popup className="menu-popup menu-popup--choices" data-flush data-sheet={side === 'top' || undefined}>
            <Menu.Group>
              <Menu.GroupLabel className="menu-group-label">{action.label}</Menu.GroupLabel>
              <Menu.RadioGroup
                value={choices.value()}
                onValueChange={(value: string) => {
                  choices.onChange(value);
                  setVersion((version) => version + 1);
                }}
              >
                {choices.options.map((option) => (
                  <Menu.RadioItem key={option.value} value={option.value} className="menu-item" closeOnClick>
                    <Menu.RadioItemIndicator className="menu-icon menu-check" keepMounted>
                      <CheckIcon />
                    </Menu.RadioItemIndicator>
                    <span className="menu-label">{option.label}</span>
                  </Menu.RadioItem>
                ))}
              </Menu.RadioGroup>
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
