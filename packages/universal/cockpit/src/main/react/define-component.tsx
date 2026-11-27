import type { ReactNode, Ref } from 'react';
import { createElement, useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { I18nAdapter } from '../index.js';

export type { ComponentSpec };
export { defineComponent };

type Client = typeof import('./client.js');

// What a component of the package needs to know about its element.
type ComponentSpec = {
  // The internal tag: the first free `internal-cockpit-<name>-<n>`.
  name: string;
  createClass: (client: Client) => CustomElementConstructor;
  // The props set as the element's properties, with the value of a missing prop (the element's default).
  properties: Readonly<Record<string, unknown>>;
  // The callback props and their events.
  events: Readonly<Record<string, string>>;
  // The props rendered into a named slot, and the slot's name.
  slots: Readonly<Record<string, string>>;
  // More slots from the props (e.g. one per crumb), as `[slot, node]`.
  moreSlots?: (props: Readonly<Record<string, unknown>>) => readonly (readonly [string, ReactNode])[];
};

const useNoI18nAdapter = (): I18nAdapter | undefined => undefined;

// A React component for an element of the package. The call itself has no side effect (it also works on the server):
// the element class is created and registered under an internal tag on the first mount on the client. Until then (and
// on the server) the component renders an empty placeholder with the element's `id`, `className` and `style`.
// `children` go straight into the element (its default slot, in its light DOM); a named slot's node is wrapped in a
// `<span slot="…" style="display: contents">`.
function defineComponent<P extends object>(
  spec: ComponentSpec,
  useI18n: () => I18nAdapter | undefined = useNoI18nAdapter,
): (props: P) => ReactNode {
  let registration: Promise<{ readonly tag: string; readonly client: Client }> | undefined;

  const register = () =>
    registration ??= import('./client.js').then((client) => {
      const tag = freeTagName(`internal-cockpit-${spec.name}-`);

      customElements.define(tag, spec.createClass(client));

      return { tag, client };
    });

  function Component(props: P): ReactNode {
    const all = props as Readonly<Record<string, unknown>>;
    const adapter = useI18n();
    const [registered, setRegistered] = useState<{ readonly tag: string; readonly client: Client }>();
    const [failure, setFailure] = useState<{ error: unknown }>();
    const [element, setElement] = useState<HTMLElement | null>(null);
    const latest = useRef(all);

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
      latest.current = all;
    });

    // Only the properties that changed.
    useLayoutEffect(() => {
      if (element === null) {
        return;
      }

      for (const [property, missing] of Object.entries(spec.properties)) {
        const value = all[property] ?? missing;

        if (Reflect.get(element, property) !== value) {
          Reflect.set(element, property, value);
        }
      }
    });

    useLayoutEffect(() => {
      if (element !== null) {
        registered?.client.setElementI18nAdapter(element, adapter);
      }
    }, [element, registered, adapter]);

    // The latest callbacks, without listening again on every render.
    useEffect(() => {
      if (element === null) {
        return;
      }

      const listeners = Object.entries(spec.events).map(([prop, type]) => {
        const listener = (event: Event) => (latest.current[prop] as ((event: Event) => void) | undefined)?.(event);

        element.addEventListener(type, listener);

        return () => element.removeEventListener(type, listener);
      });

      return () => {
        for (const remove of listeners) {
          remove();
        }
      };
    }, [element]);

    useLayoutEffect(() => (element === null ? undefined : assignRef(all['ref'] as Ref<HTMLElement>, element)), [
      element,
      all['ref'],
    ]);

    // A tag name that is taken, e.g.: thrown during rendering, so an error boundary gets it.
    if (failure !== undefined) {
      throw failure.error;
    }

    const { id, className, style, lang } = all as { id?: string; className?: string; style?: object; lang?: string };

    if (registered === undefined) {
      return <div id={id} className={className} style={style} aria-busy />;
    }

    const attributes = Object.fromEntries(
      Object.entries(all).filter(([key]) => key.startsWith('aria-') || key.startsWith('data-')),
    );
    const slots = [
      ...Object.entries(spec.slots).map(([prop, slot]) => [slot, all[prop] as ReactNode] as const),
      ...(spec.moreSlots?.(all) ?? []),
    ];

    return createElement(
      registered.tag,
      { ...attributes, ref: setElement, id, className, style, lang },
      all['children'] as ReactNode,
      ...slots.map(([slot, node]) =>
        node === undefined || node === null
          ? null
          : <span key={slot} slot={slot} style={{ display: 'contents' }}>{node}</span>
      ),
    );
  }

  return Component;
}

function freeTagName(prefix: string): string {
  let index = 1;

  while (customElements.get(`${prefix}${index}`) !== undefined) {
    index++;
  }

  return `${prefix}${index}`;
}

// Sets the app's ref to the element, and back to `null` when it goes away. A callback ref may return its own cleanup.
function assignRef(ref: Ref<HTMLElement> | undefined, element: HTMLElement): (() => void) | undefined {
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
