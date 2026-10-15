import type { ReactElement } from 'react';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { PersonTable } from '../components/PersonTable.js';

export { MembersPage };

// The "Members" module: all people.
function MembersPage(): ReactElement {
  const t = useTranslate();

  return <PersonTable title={t('modules.members')} subtitle={t('members.listSubtitle')} />;
}
