import { Anchor, Stack, Text, Title } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link } from 'react-router';

export { NotFound };

// A path without a page, or a board or meeting that does not exist (any more: it may have been deleted).
function NotFound({ what = 'page' }: { what?: string }): ReactElement {
  return (
    <Stack gap="xs" py="xl" align="center">
      <Title order={2} size="h3">Not found</Title>
      <Text c="dimmed">This {what} does not exist, or it has been deleted.</Text>
      <Anchor component={Link} to="/">Go to the home page</Anchor>
    </Stack>
  );
}
