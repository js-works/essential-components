import { Anchor, VisuallyHidden } from '@mantine/core';

import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { appIcons } from '../../../shared/shared.js';

export { WebsiteLink };

// A website as a link that opens in a new tab, without `https://` and a trailing `/` in its text, marked as external
// (an arrow out of a box after it; for screen readers, "opens in a new tab").
function WebsiteLink({ url }: { url: string }) {
  const t = useTranslate();

  if (url === '') {
    return null;
  }

  return (
    <Anchor href={url} target="_blank" rel="noopener noreferrer" size="sm" className="board-manager__external-link">
      {url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
      {appIcons.external}
      <VisuallyHidden>{t('organizations.opensInNewTab')}</VisuallyHidden>
    </Anchor>
  );
}
