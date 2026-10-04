import { Anchor, Stack, Text, Title } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { useTranslate } from '../lib/i18n';

export { NotFound };

// A path without a page, or a board or meeting that does not exist (any more: it may have been deleted).
function NotFound(
  { what = 'page' }: { what?: 'page' | 'board' | 'meeting' | 'member' | 'organization' },
): ReactElement {
  const t = useTranslate();

  return (
    <Stack gap="xs" py="xl" align="center">
      <Title order={2} size="h3">{t('notFound.title')}</Title>
      <Text c="dimmed">{t(`notFound.${what}`)}</Text>
      <Anchor component={Link} to="/">{t('notFound.goHome')}</Anchor>
    </Stack>
  );
}
