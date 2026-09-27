import type { DataNavigatorComponent as Spec } from '../react/api';

export { connectController, createDataNavigatorController, notifySelection, subscribeToSelection };
export type { ControllerTarget };

// What a mounted table offers its controller. The controller only forwards to it.
type ControllerTarget = {
  reload: () => void;
  clearRowSelection: () => void;
  getSelectedRows: () => readonly unknown[];
};

type ControllerState = {
  target: ControllerTarget | undefined;
  readonly listeners: Set<() => void>;
};

const NO_ROWS: readonly never[] = [];

// The inner state of every controller, by controller. Not part of the controller object, so the public object has
// only its three methods.
const states = new WeakMap<object, ControllerState>();

// The framework-free core of a controller (the React hook only keeps one stable, the custom element will use it too).
// Without a connected table, the calls do nothing and there are no selected rows.
function createDataNavigatorController<Row>(): Spec.Controller<Row> {
  const state: ControllerState = { target: undefined, listeners: new Set() };
  const controller: Spec.Controller<Row> = {
    reload: () => state.target?.reload(),
    clearRowSelection: () => state.target?.clearRowSelection(),
    // The target hands out the rows of the table, whose row type is the controller's.
    getSelectedRows: () => (state.target?.getSelectedRows() ?? NO_ROWS) as readonly Row[],
  };

  states.set(controller, state);

  return controller;
}

function stateOf(controller: object): ControllerState {
  const state = states.get(controller);

  if (state === undefined) {
    throw new Error('This is not a DataNavigator controller. Create one with useDataNavigatorController().');
  }

  return state;
}

// A mounted table connects to its controller, and disconnects when it unmounts (the returned function). One controller
// serves one table: a second table that connects while the first one is still connected is an error.
function connectController(controller: object, target: ControllerTarget): () => void {
  const state = stateOf(controller);

  if (state.target !== undefined) {
    throw new Error(
      'This DataNavigator controller is already used by another DataNavigator. Use one controller per table '
        + '(useDataNavigatorController() for each).',
    );
  }

  state.target = target;
  notify(state);

  return () => {
    if (state.target === target) {
      state.target = undefined;
      notify(state);
    }
  };
}

function notify(state: ControllerState): void {
  for (const listener of state.listeners) {
    listener();
  }
}

// Listens to changes of the selection of the connected table (and to connecting and disconnecting).
function subscribeToSelection(controller: object, listener: () => void): () => void {
  const state = stateOf(controller);

  state.listeners.add(listener);

  return () => state.listeners.delete(listener);
}

// Called by the table whenever its selected rows change.
function notifySelection(controller: object): void {
  notify(stateOf(controller));
}
