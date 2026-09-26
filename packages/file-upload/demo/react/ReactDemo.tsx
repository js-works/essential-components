import { createContext, StrictMode, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import type { FileUpload } from '../../src';
import { createFileUploadComponent } from '../../src/react';
import { submitted, summarize } from '../format';
import { createLocaleI18n } from '../i18n';
import { createUpload } from '../upload';

export { mountReactDemo };

// The language of a part of the page, as a React context (like the provider of an i18n library).
const Locale = createContext('en-US');

// Each instance follows the nearest `Locale`: the hook runs in the component on every render.
const Upload = createFileUploadComponent({
  i18n: {
    type: 'hook',
    useAdapter: () => {
      const locale = useContext(Locale);

      return useMemo(() => createLocaleI18n(locale), [locale]);
    },
  },
});

const upload = createUpload('works');

// One column: its own language, one component in a form. A submit shows what the form sends (the ids of the uploaded
// files); while the component is invalid, the browser blocks it and shows the message.
function Column(
  { title, initialLocale, label, prompt }: { title: string; initialLocale: string; label: ReactNode; prompt?: string },
) {
  const [locale, setLocale] = useState(initialLocale);
  const [required, setRequired] = useState(false);
  const [items, setItems] = useState<readonly FileUpload.FileItem[]>([]);
  const [sent, setSent] = useState('');

  return (
    <section className="ui-stack">
      <h2 className="ui-heading">{title}</h2>
      <div className="ui-toolbar">
        <label className="ui-field">
          Language
          <select className="ui-select" value={locale} onChange={(event) => setLocale(event.target.value)}>
            <option value="en-US">English</option>
            <option value="de-DE">Deutsch</option>
          </select>
        </label>
        <label className="ui-field">
          Required
          <select
            className="ui-select"
            value={required ? 'on' : 'off'}
            onChange={(event) => setRequired(event.target.value === 'on')}
          >
            <option value="off">off</option>
            <option value="on">on</option>
          </select>
        </label>
      </div>
      <Locale value={locale}>
        <form
          className="ui-stack ui-stack--tight"
          onSubmit={(event) => {
            event.preventDefault();
            setSent(submitted(new FormData(event.currentTarget)));
          }}
        >
          <Upload
            name="attachments"
            upload={upload}
            multiple
            previews
            required={required}
            label={label}
            prompt={prompt}
            onChange={setItems}
          />
          <p className="ui-note">{summarize(items)}</p>
          <div className="ui-toolbar">
            <button className="ui-button">Submit</button>
            <output className="ui-result">{sent}</output>
          </div>
        </form>
      </Locale>
    </section>
  );
}

// The content of the "React" tab.
function App() {
  return (
    <div className="ui-columns">
      <Column title="English" initialLocale="en-US" label="Attachments" />
      <Column
        title="German, own prompt (a slot)"
        initialLocale="de-DE"
        label={
          <>
            Rechnungen <small>(PDF, a JSX label)</small>
          </>
        }
        prompt="Rechnungen hierher ziehen oder"
      />
    </div>
  );
}

// Renders the React demo into the container. Returns the unmount.
function mountReactDemo(container: Element): () => void {
  const root = createRoot(container);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  return () => root.unmount();
}
