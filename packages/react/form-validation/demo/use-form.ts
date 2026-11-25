import { defineUseForm } from '../src/index.js';
import { adapter } from './i18n.js';

export { useForm };

// Once per app: the adapter (texts of the demo's language), and the names of the props of the demo's field components.
const useForm = defineUseForm({
  useI18n: () => adapter,
  appNamespace: 'demo',
  props: { label: 'label', error: 'errorText' },
});
