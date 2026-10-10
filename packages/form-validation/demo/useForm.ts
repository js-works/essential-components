import { defineUseForm } from '../src';
import { adapter } from './i18n';

export { useForm };

// Once per app: the adapter (texts of the demo's language), and the names of the props of the demo's field components.
const useForm = defineUseForm({
  i18n: { type: 'factory', getAdapter: () => adapter },
  appNamespace: 'demo',
  props: { label: 'label', error: 'errorText' },
});
