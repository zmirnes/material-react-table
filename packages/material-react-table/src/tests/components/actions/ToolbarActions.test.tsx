import type * as ReactModule from 'react';
import ToolbarActions from '../../../components/actions/ToolbarActions';
import { type TestRowData } from '../../helpers/actionMockBuilders';
import type { MRT_TableInstance } from '../../../types';
import type { Action } from '../../../types/actions-types';
import { describe, expect, it, vi } from 'vitest';

// Replace useMemo with a pass-through so the component can be called as a plain
// function without a React fiber context — consistent with the no-mount test strategy
vi.mock('react', async () => {
  const actualReact = await vi.importActual<typeof ReactModule>('react');
  return { ...actualReact, useMemo: (fn: () => unknown) => fn() };
});

// Builds a partial MRT_TableInstance mock that covers every field ToolbarActions reads:
// getState (for rowSelection) and options.actions
const buildMockTableForToolbar = (
  actions: Action<TestRowData>[] | undefined,
  selectedRowIds: string[] = [],
): MRT_TableInstance<TestRowData> => {
  // Convert the array of selected IDs into the { [id]: boolean } shape that rowSelection uses
  const rowSelection = Object.fromEntries(
    selectedRowIds.map((id) => [id, true]),
  );
  return {
    getState: () => ({ rowSelection }),
    options: { actions },
  } as unknown as MRT_TableInstance<TestRowData>;
};

describe('ToolbarActions', () => {
  it('does not throw when table.options.actions is undefined', () => {
    const mockTable = buildMockTableForToolbar(undefined);

    // Optional chaining actions?.map must handle undefined without crashing
    expect(() => ToolbarActions({ table: mockTable })).not.toThrow();
  });

  it('calls renderToolbar with the correct table context for each action', () => {
    const mockRenderToolbar = vi.fn().mockReturnValue(null);
    const actions: Action<TestRowData>[] = [
      { name: 'delete', renderToolbar: mockRenderToolbar },
    ];
    const mockTable = buildMockTableForToolbar(actions, ['row-1']);

    ToolbarActions({ table: mockTable });

    // renderToolbar must receive the same table instance that the component received
    expect(mockRenderToolbar).toHaveBeenCalledOnce();
    expect(mockRenderToolbar).toHaveBeenCalledWith({ table: mockTable });
  });

  it('does not throw when an action does not define renderToolbar', () => {
    // Optional chaining renderToolbar?.() must handle a missing renderToolbar gracefully
    const actionWithoutRenderToolbar: Action<TestRowData> = { name: 'view' };
    const mockTable = buildMockTableForToolbar([actionWithoutRenderToolbar]);

    expect(() => ToolbarActions({ table: mockTable })).not.toThrow();
  });
});
