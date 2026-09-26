import { describe, expect, it, vi } from 'vitest';
import { connectController, createDataNavigatorController, notifySelection, subscribeToSelection } from './controller';

const targetOf = (rows: readonly unknown[] = []) => ({
  reload: vi.fn(),
  clearRowSelection: vi.fn(),
  getSelectedRows: () => rows,
});

describe('controller (core)', () => {
  it('ignores calls and has no selected rows while no table is connected', () => {
    const controller = createDataNavigatorController<{ id: number }>();

    expect(() => controller.reload()).not.toThrow();
    expect(() => controller.clearRowSelection()).not.toThrow();
    expect(controller.getSelectedRows()).toEqual([]);
  });

  it('forwards to the connected table, and stops after it disconnected', () => {
    const controller = createDataNavigatorController<string>();
    const target = targetOf(['a']);
    const disconnect = connectController(controller, target);

    controller.reload();
    controller.clearRowSelection();

    expect(target.reload).toHaveBeenCalledTimes(1);
    expect(target.clearRowSelection).toHaveBeenCalledTimes(1);
    expect(controller.getSelectedRows()).toEqual(['a']);

    disconnect();
    controller.reload();

    expect(target.reload).toHaveBeenCalledTimes(1);
    expect(controller.getSelectedRows()).toEqual([]);
  });

  it('serves one table: a second one that connects while the first is connected is an error', () => {
    const controller = createDataNavigatorController();
    const disconnect = connectController(controller, targetOf());

    expect(() => connectController(controller, targetOf())).toThrow(/already used by another DataNavigator/);

    // after the first one disconnected, the controller can be used again
    disconnect();

    expect(() => connectController(controller, targetOf())).not.toThrow();
  });

  it('rejects objects that are not controllers', () => {
    expect(() => connectController({}, targetOf())).toThrow(/not a DataNavigator controller/);
  });

  it('notifies its listeners when the selection changes, and when a table connects or disconnects', () => {
    const controller = createDataNavigatorController();
    const listener = vi.fn();
    const unsubscribe = subscribeToSelection(controller, listener);
    const disconnect = connectController(controller, targetOf());

    notifySelection(controller);
    disconnect();

    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    notifySelection(controller);

    expect(listener).toHaveBeenCalledTimes(3);
  });
});
