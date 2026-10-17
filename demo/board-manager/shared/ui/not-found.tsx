import { Stack, Text, Title } from '@mantine/core';

import { AnchorLink } from '@local/micro-app';

import { useTranslate } from '../lib/i18n/index.js';

export { NotFound };

// A path without a page, or a board or meeting that does not exist (any more: it may have been deleted).
function NotFound(
  { what = 'page' }: { what?: 'page' | 'board' | 'meeting' | 'member' | 'organization' },
) {
  const t = useTranslate();

  return (
    <Stack gap="xs" py="xl" align="center">
      <Title order={2} size="h3">{t('notFound.title')}</Title>
      <Text c="dimmed">{t(`notFound.${what}`)}</Text>
      <AnchorLink to="/">{t('notFound.goHome')}</AnchorLink>
    </Stack>
  );
}
