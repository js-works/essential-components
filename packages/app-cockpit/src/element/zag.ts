import { normalizeProps, spreadProps, VanillaMachine } from '@zag-js/vanilla';
import { nothing } from 'lit';
import { Directive, directive, PartType } from 'lit/directive.js';
import type { ElementPart, PartInfo } from 'lit/directive.js';

export { spread, ZagMachines };

// Zag.js in Lit: the props of a Zag part (`api.getTriggerProps()`, ...) are spread onto an element of a template by the
// `spread` directive (attributes, ARIA, event listeners; the previous ones are removed first), and the machines live in
// a registry of the element (`ZagMachines`): one per key, made on first use, started at once, stopped with the element.
// Every change of a machine renders the element again.

class SpreadDirective extends Directive {
  #cleanup: (() => void) | undefined;

  constructor(info: PartInfo) {
    super(info);

    if (info.type !== PartType.ELEMENT) {
      throw new Error('spread() belongs on an element: <div ${spread(props)}>');
    }
  }

  render(_props: Record<string, unknown>) {
    return nothing;
  }

  override update(part: ElementPart, [props]: [Record<string, unknown>]) {
    this.#cleanup?.();
    this.#cleanup = spreadProps(part.element, props);

    return nothing;
  }
}

const spread = directive(SpreadDirective);

// A Zag component: its machine and its connect function (e.g. `menu.machine`, `menu.connect`).
type Component<Api> = {
  // biome-ignore lint: the machines' own types are generic beyond use here
  machine: any;
  connect: (service: any, normalize: typeof normalizeProps) => Api;
};

type Entry = { machine: VanillaMachine<any>; current: { props: object }; stop: () => void };

// The new props, but with the previous objects where nothing changed: the templates make new objects (and functions) on
// every render, and a machine that watches e.g. `positioning` would react to each new one (computing the position, which
// renders again, endlessly). Functions count as equal (they read the latest state when called).
function stable<T>(previous: T, next: T): T {
  return same(previous, next) ? previous : next;
}

function same(a: unknown, b: unknown): boolean {
  if (a === b || (typeof a === 'function' && typeof b === 'function')) {
    return true;
  }

  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }

  if (Array.isArray(a) !== Array.isArray(b) || Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
    return false;
  }

  const keys = Object.keys(a);

  return keys.length === Object.keys(b).length
    && keys.every((key) => same((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
}

class ZagMachines {
  readonly #machines = new Map<string, Entry>();
  readonly #rerender: () => void;

  constructor(rerender: () => void) {
    this.#rerender = rerender;
  }

  // The api of the machine `key` (made with `props` on first use; later uses update its props, which the machine reads
  // through a function, so it always sees the latest).
  use<Api>(key: string, component: Component<Api>, props: object): Api {
    let entry = this.#machines.get(key);

    if (entry === undefined) {
      const current = { props };
      const machine = new VanillaMachine(component.machine, () => current.props);

      machine.start();

      const unsubscribe = machine.subscribe(() => this.#rerender());

      entry = {
        machine,
        current,
        stop: () => {
          unsubscribe();
          machine.stop();
        },
      };
      this.#machines.set(key, entry);
    } else {
      const previous = entry.current.props as Record<string, unknown>;
      const next = Object.fromEntries(
        Object.entries(props).map(([name, value]) => [name, stable(previous[name], value)]),
      );
      const changed = Object.keys({ ...previous, ...next }).some((name) => previous[name] !== next[name]);

      entry.current.props = next;

      // A machine reacts to changed props (e.g. a controlled `open`) only when it is notified (its watchers run then).
      // Not public in its types; `updateProps()` would nest the props in a new function on every call.
      if (changed) {
        (entry.machine as unknown as { notify: () => void }).notify();
      }
    }

    return component.connect(entry.machine.service, normalizeProps);
  }

  stopAll(): void {
    for (const entry of this.#machines.values()) {
      entry.stop();
    }

    this.#machines.clear();
  }
}
