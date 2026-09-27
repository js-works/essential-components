import { createElement, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import type * as Spec from '../api';
import { DEFAULT_THEME, DENSITY_PADDING } from '../element/styles';
import type * as ReactSpec from './api';

export { createFileUploadComponent };

// The element class, registered under its tag name, and the internal setter for an adapter per element.
type Registration = {
  readonly tag: string;
  readonly setI18nAdapter: (element: Spec.Element, adapter: Spec.I18nAdapter | undefined) => void;
};

// The props that become properties of the element, with the value for "not set".
const PROPERTY_DEFAULTS = {
  upload: undefined,
  accept: undefined,
  maxFiles: undefined,
  maxFileSize: undefined,
  multiple: false,
  manualUpload: false,
  previews: false,
  density: 'normal',
  disabled: false,
  name: undefined,
  required: false,
} as const satisfies Partial<Record<keyof Spec.Element, unknown>>;

const PROPERTIES = Object.keys(PROPERTY_DEFAULTS) as readonly (keyof typeof PROPERTY_DEFAULTS)[];

const SLOTS = ['label', 'icon', 'prompt', 'limits'] as const;

// A generated tag name: the first free one of `internal-file-upload-1`, `-2`, ...
const TAG_PREFIX = 'internal-file-upload-';

// The height of the empty element (the drop line only), relative to the theme's `fontSize`: its content (1.608em), its
// padding (per density) and the borders (4px).
const placeholderHeight = (density: Spec.Density) =>
  `calc(${Number((1.608 + 2 * DENSITY_PADDING[density].drop).toFixed(3))}em + 4px)`;

const useNoI18nAdapter = (): Spec.I18nAdapter | undefined => undefined;

// A React component for the file upload element. The call itself has no side effect (it also works on the server): the
// element class is created and registered on the first mount on the client. Until then (and on the server) the
// component renders a placeholder with the height of the empty element.
function createFileUploadComponent(config: ReactSpec.Config = {}): (props: ReactSpec.Props) => ReactNode {
  const { i18n, tagName, ...rest } = config;
  const fontSize = config.theme?.fontSize ?? DEFAULT_THEME.fontSize;
  let registration: Promise<Registration> | undefined;

  // The union type prevents any other `type`, but not in plain JavaScript or with a cast config.
  if (i18n !== undefined && i18n.type !== 'factory' && i18n.type !== 'hook') {
    throw new TypeError(
      `Unknown i18n type: ${String((i18n as { type: unknown }).type)} (expected 'factory' or 'hook').`,
    );
  }

  // A factory goes to the element class, a hook runs in the component.
  const elementConfig = i18n?.type === 'factory' ? { ...rest, i18n } : rest;
  const useI18nAdapter = i18n?.type === 'hook' ? i18n.useAdapter : useNoI18nAdapter;

  const register = () =>
    registration ??= import('./client').then(({ createFileUploadClass, setElementI18nAdapter }) => {
      const elementClass = createFileUploadClass(elementConfig);
      const tag = tagName ?? freeTagName();

      customElements.define(tag, elementClass);

      return { tag, setI18nAdapter: setElementI18nAdapter };
    });

  function FileUpload(props: ReactSpec.Props): ReactNode {
    const { ref, onChange, lang, id, className, style, maxParallel, label, icon, prompt, limits, ...rest } = props;
    const adapter = useI18nAdapter();
    const [registered, setRegistered] = useState<Registration>();
    const [failure, setFailure] = useState<{ error: unknown }>();
    const [element, setElement] = useState<Spec.Element | null>(null);
    const onChangeRef = useRef(onChange);

    // Client only: effects do not run on the server.
    useEffect(() => {
      let active = true;

      register().then(
        (result) => active && setRegistered(result),
        (error: unknown) => active && setFailure({ error }),
      );

      return () => {
        active = false;
      };
    }, []);

    useLayoutEffect(() => {
      onChangeRef.current = onChange;
    });

    // Only the properties that changed: every change renders the list of the element again.
    useLayoutEffect(() => {
      if (element === null) {
        return;
      }

      for (const property of PROPERTIES) {
        const value = props[property] ?? PROPERTY_DEFAULTS[property];

        if (element[property] !== value) {
          Reflect.set(element, property, value);
        }
      }

      // Not set: the attribute goes away, so the element's default applies.
      if (maxParallel === undefined) {
        element.removeAttribute('max-parallel');
      } else if (element.maxParallel !== maxParallel) {
        element.maxParallel = maxParallel;
      }
    });

    useLayoutEffect(() => {
      if (element !== null) {
        registered?.setI18nAdapter(element, adapter);
      }
    }, [element, registered, adapter]);

    useEffect(() => {
      if (element === null) {
        return;
      }

      const listener = () => onChangeRef.current?.(element.items);

      element.addEventListener('change', listener);

      return () => element.removeEventListener('change', listener);
    }, [element]);

    useLayoutEffect(() => (element === null ? undefined : assignRef(ref, element)), [element, ref]);

    // A tag name that is taken, e.g.: thrown during rendering, so an error boundary gets it.
    if (failure !== undefined) {
      throw failure.error;
    }

    if (registered === undefined) {
      return (
        <div
          id={id}
          className={className}
          style={{ fontSize, minHeight: placeholderHeight(props.density ?? 'normal'), ...style }}
          aria-busy
        />
      );
    }

    const slots = { label, icon, prompt, limits };
    const attributes = Object.fromEntries(
      Object.entries(rest).filter(([key]) => key.startsWith('aria-') || key.startsWith('data-')),
    );

    return createElement(
      registered.tag,
      { ...attributes, ref: setElement, lang, id, className, style },
      SLOTS.map((slot) => slots[slot] === undefined ? null : <span key={slot} slot={slot}>{slots[slot]}</span>),
    );
  }

  return FileUpload;
}

function freeTagName(): string {
  let index = 1;

  while (customElements.get(`${TAG_PREFIX}${index}`) !== undefined) {
    index++;
  }

  return `${TAG_PREFIX}${index}`;
}

// Sets the app's ref to the element, and back to `null` when it goes away. A callback ref may return its own cleanup.
function assignRef(ref: Ref<Spec.Element> | undefined, element: Spec.Element): (() => void) | undefined {
  if (typeof ref === 'function') {
    const cleanup = ref(element);

    return typeof cleanup === 'function' ? cleanup : () => ref(null);
  }

  if (ref !== undefined && ref !== null) {
    ref.current = element;

    return () => {
      ref.current = null;
    };
  }

  return undefined;
}
