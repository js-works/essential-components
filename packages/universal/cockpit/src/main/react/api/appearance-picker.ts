import type {
  AppearanceAccent,
  AppearancePickerClassConfig,
  AppearancePickerElement,
  AppearanceScheme,
} from '../../api/appearance-picker.js';
import type { CockpitCommonProps, CockpitComponentI18n } from './base.js';

export type { AppearancePickerComponentConfig, AppearancePickerProps };

type AppearancePickerComponentConfig = Omit<AppearancePickerClassConfig, 'i18n'> & CockpitComponentI18n;

// The element's properties (see `AppearancePickerElement`), its event as a callback: the user's choice, already in the
// element (`event.currentTarget`'s `scheme` and `accent`); a controlled component sets the props from it.
type AppearancePickerProps = CockpitCommonProps<AppearancePickerElement> & {
  scheme?: AppearanceScheme;
  accents?: readonly AppearanceAccent[];
  accent?: string;
  onChange?: (event: Event) => void;
};
