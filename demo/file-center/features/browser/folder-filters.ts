import { selectFilter } from '@local/data-table/react';
import type { TableFilter } from '@local/data-table/react';
import { FILE_KINDS } from '../../domain/index.js';
import { KIND_LABELS } from './labels.js';

export { fileKindFilter, ownerFilter };

// The filter of a file's kind (document, image, …).
const fileKindFilter = selectFilter({
  options: FILE_KINDS.map((kind) => ({ value: kind, label: KIND_LABELS[kind] })),
  multiple: true,
});

// The filter of an owner: the given owners.
function ownerFilter(owners: readonly string[]): TableFilter {
  return selectFilter({ options: owners.map((owner) => ({ value: owner, label: owner })), multiple: true });
}
