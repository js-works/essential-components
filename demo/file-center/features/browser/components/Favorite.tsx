import { ActionIcon, Button } from '@mantine/core';
import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { appIcons } from '../../../shared/ui/icons';

export { FavoriteButton, FavoriteStar };

// The star of a folder or file in a table (2026-10-08): filled while it is a favorite, an outline (only while the name
// is hovered or the star has the focus) otherwise. A click marks or unmarks it at once, then saves (`onChange`); a
// failed save takes it back.
function FavoriteStar({ favorite, onChange }: {
  favorite: boolean;
  onChange: (favorite: boolean) => Promise<void>;
}): ReactElement {
  const [shown, setShown] = useState(favorite);

  useEffect(() => setShown(favorite), [favorite]);

  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      size="sm"
      className="file-center__star"
      data-on={shown || undefined}
      aria-pressed={shown}
      aria-label={shown ? 'Remove from favorites' : 'Add to favorites'}
      onClick={(event) => {
        event.stopPropagation();
        setShown(!shown);
        onChange(!shown).catch(() => setShown(shown));
      }}
      // Not the row's default action.
      onDoubleClick={(event) => event.stopPropagation()}
    >
      {shown ? appIcons.starFilled : appIcons.star}
    </ActionIcon>
  );
}

// The same in a drawer of details: a button that says what it does.
function FavoriteButton({ favorite, onChange }: {
  favorite: boolean;
  onChange: (favorite: boolean) => Promise<void>;
}): ReactElement {
  const [on, setOn] = useState(favorite);
  const [saving, setSaving] = useState(false);

  return (
    <Button
      variant="default"
      size="xs"
      leftSection={
        <span className="file-center__star" data-on={on || undefined}>
          {on ? appIcons.starFilled : appIcons.star}
        </span>
      }
      loading={saving}
      onClick={async () => {
        setSaving(true);

        try {
          await onChange(!on);
          setOn(!on);
        } finally {
          setSaving(false);
        }
      }}
    >
      {on ? 'Remove from favorites' : 'Add to favorites'}
    </Button>
  );
}
