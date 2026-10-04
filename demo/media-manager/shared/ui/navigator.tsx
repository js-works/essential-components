import { i18n as navigatorI18n } from '../../../../packages/data-navigator/demo/i18n';
import { createDataNavigatorComponent } from '../../../../packages/data-navigator/src/react';
import { mantineTheme } from '../../../../packages/data-navigator/src/themes';

export { Navigator };

// The data navigator of the app, in Mantine's look. It follows `<html lang>` through the i18n adapter of its demo.
const Navigator = createDataNavigatorComponent({ i18n: navigatorI18n, theme: mantineTheme });
