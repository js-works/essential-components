import i18next from 'i18next';
import type { I18nAdapter } from '../../../../packages/form-validation/src';

export { i18nAdapter };

// The app's own translations, with i18next (its own instance, not the global one): so far only the labels of the
// forms (form-validation). The language follows `<html lang>` (the page's language switch); English is the fallback.
// The rest of the app is English only.

const i18n = i18next.createInstance();

const pageLanguage = () => document.documentElement.lang || 'en';

void i18n.init({
  // The resources are inline, so `init` finishes synchronously: the first render is translated.
  initAsync: false,
  lng: pageLanguage(),
  fallbackLng: 'en',
  ns: ['app'],
  defaultNS: 'app',
  resources: {
    en: {
      app: {
        organization: {
          name: 'Name',
          description: 'Description',
          street: 'Street',
          zipCode: 'ZIP code',
          city: 'City',
          country: 'Country',
          website: 'Website',
        },
        person: { name: 'Name', email: 'Email', organizationId: 'Organization' },
        board: { name: 'Name', description: 'Description' },
        meeting: { boardId: 'Board', title: 'Title', start: 'Date and time', location: 'Location' },
        agendaItem: {
          title: 'Title',
          sectionId: 'Section',
          presenterId: 'Presenter',
          duration: 'Duration (minutes)',
          description: 'Description',
        },
        document: { name: 'Name' },
        member: { personId: 'Person', role: 'Role' },
        minutes: { minutes: 'Minutes', decision: 'Decision' },
      },
    },
    de: {
      app: {
        organization: {
          name: 'Name',
          description: 'Beschreibung',
          street: 'Straße',
          zipCode: 'PLZ',
          city: 'Ort',
          country: 'Land',
          website: 'Website',
        },
        person: { name: 'Name', email: 'E-Mail', organizationId: 'Organisation' },
        board: { name: 'Name', description: 'Beschreibung' },
        meeting: { boardId: 'Gremium', title: 'Titel', start: 'Datum und Uhrzeit', location: 'Ort' },
        agendaItem: {
          title: 'Titel',
          sectionId: 'Abschnitt',
          presenterId: 'Vortragende Person',
          duration: 'Dauer (Minuten)',
          description: 'Beschreibung',
        },
        document: { name: 'Name' },
        member: { personId: 'Person', role: 'Rolle' },
        minutes: { minutes: 'Protokoll', decision: 'Beschluss' },
      },
    },
  },
  interpolation: { escapeValue: false }, // React escapes
});

// Every change of `<html lang>` is a change of the language.
new MutationObserver(() => void i18n.changeLanguage(pageLanguage())).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['lang'],
});

// The adapter of the components (here form-validation): a namespace i18next does not know (e.g. 'formvalidation')
// gives the `defaultValue`, the text of the component.
const i18nAdapter: I18nAdapter = {
  currentLocale: () => i18n.language,
  resolveText: (namespace, key, params, defaultValue) => i18n.t(key, { ns: namespace, ...params, defaultValue }),
  onChange: (listener) => {
    i18n.on('languageChanged', listener);

    return () => i18n.off('languageChanged', listener);
  },
};
