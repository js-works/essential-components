import { createFileRoute } from '@tanstack/react-router';

import { PersonTable } from '../../features/members/person-table.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';

export const Route = createFileRoute('/members/')({ component: MembersPage });

// The "Members" module: all people.
function MembersPage() {
  const t = useTranslate();

  return <PersonTable title={t('modules.members')} subtitle={t('members.listSubtitle')} />;
}
