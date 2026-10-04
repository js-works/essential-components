import type { ReactElement } from 'react';
import { useTranslate } from '../../../shared/lib/i18n';
import { PeopleTable } from '../components/PeopleTable';

export { MembersPage };

// The "Members" module: all people.
function MembersPage(): ReactElement {
  const t = useTranslate();

  return <PeopleTable title={t('modules.members')} subtitle={t('members.listSubtitle')} />;
}
