import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { PersonTable } from '../components/person-table.js';

export { MembersPage };

// The "Members" module: all people.
function MembersPage() {
  const t = useTranslate();

  return <PersonTable title={t('modules.members')} subtitle={t('members.listSubtitle')} />;
}
