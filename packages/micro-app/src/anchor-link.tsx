import type { AnchorProps } from '@mantine/core';
import { Anchor } from '@mantine/core';
import { createLink } from '@tanstack/react-router';
import type { ComponentPropsWithRef } from 'react';

export { AnchorLink };

// Mantine's `Anchor` as a link of the router (typed by the app's registered router): a plain anchor first (`Anchor` is
// polymorphic), as TanStack Router's docs do it.
function AnchorBase(props: AnchorProps & ComponentPropsWithRef<'a'>) {
  return <Anchor component="a" {...props} />;
}

const AnchorLink = createLink(AnchorBase);
