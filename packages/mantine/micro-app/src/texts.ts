import cockpitDe from '@local/cockpit/locales/de.json' with { type: 'json' };
import cockpitEn from '@local/cockpit/locales/en.json' with { type: 'json' };
import dataTableDe from '@local/data-table/locales/de.json' with { type: 'json' };
import dataTableEn from '@local/data-table/locales/en.json' with { type: 'json' };
import formValidationDe from '@local/form-validation/locales/de.json' with { type: 'json' };
import formValidationEn from '@local/form-validation/locales/en.json' with { type: 'json' };
import overlaysDe from '@local/overlays/locales/de.json' with { type: 'json' };
import overlaysEn from '@local/overlays/locales/en.json' with { type: 'json' };

export { microAppResources };

// The texts of the building blocks, in English and German, as i18next resources (ICU messages: the app's i18next uses
// `i18next-icu`), which the app adds to its instance (`resources: { en: { ...microAppResources.en, app: … }, … }`):
// the namespace `microApp`, and the translations of the tier-1 packages it uses, as they ship them (`cockpit`, the app
// header's; `dataTable`; `formValidation`; `overlays`). An app with another of them (e.g. `fileUpload`) adds its
// `locales/*.json` the same way.
const microAppTexts = {
  en: {
    home: 'Home',
    open: 'Open',
    edit: 'Edit',
    delete: 'Delete',
  },
  de: {
    home: 'Start',
    open: 'Öffnen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
  },
} as const;

const microAppResources = {
  en: {
    microApp: microAppTexts.en,
    cockpit: cockpitEn,
    dataTable: dataTableEn,
    formValidation: formValidationEn,
    overlays: overlaysEn,
  },
  de: {
    microApp: microAppTexts.de,
    cockpit: cockpitDe,
    dataTable: dataTableDe,
    formValidation: formValidationDe,
    overlays: overlaysDe,
  },
} as const;
