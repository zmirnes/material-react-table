import {
  canInsertSelectedRowsWithoutExceedingMaxDepth,
  getDeepestSubRowDepth,
  getSelectedReorderRowIds,
} from '../../fns/treeRowReorderingFns';
import { useMaterialReactTable } from '../../hooks/useMaterialReactTable';
import {
  type MRT_Row,
  type MRT_RowData,
  type MRT_TableInstance,
  type MRT_TableOptions,
} from '../../types';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const createMockTable = <TData extends MRT_RowData>(
  tableOptions: MRT_TableOptions<TData>,
) => {
  const { result } = renderHook(() =>
    useMaterialReactTable<TData>(tableOptions),
  );
  return result.current;
};

const createMockRow = <TData extends MRT_RowData>({
  table,
  index = 0,
}: {
  table: MRT_TableInstance<TData>;
  index?: number;
}): MRT_Row<TData> => {
  return table.getRowModel().rows[index];
};

const getRowAtDepth = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  depth: number,
): MRT_Row<TData> | undefined => {
  let row = table.getRowModel().rows[0];
  for (let i = 1; i < depth; i++) {
    if (!row.subRows?.[0]) return undefined;
    row = row.subRows[0] as MRT_Row<TData>;
  }
  return row;
};

describe('getDeepestSubRowDepth', () => {
  it('should return row depth when row has no subRows', () => {
    const table = createMockTable({
      columns: [],
      data: [{ id: 'row1' }],
    });
    const row = createMockRow({ table, index: 0 });

    const result = getDeepestSubRowDepth(row);

    expect(result).toBe(0);
  });

  it('should return row depth when row has undefined subRows', () => {
    const table = createMockTable({
      columns: [],
      data: [{ id: 'row1' }],
    });
    const row = createMockRow({ table, index: 0 });

    const result = getDeepestSubRowDepth(row);

    expect(result).toBe(0);
  });

  it('should return deepest depth from nested subRows', () => {
    const table = createMockTable({
      columns: [],
      data: [
        {
          id: 'row1',
          subRows: [
            {
              id: 'subrow1',
              subRows: [
                {
                  id: 'subsubrow1',
                  subRows: [{ id: 'subsubsubrow1' }],
                },
              ],
            },
          ],
        },
      ],
    });

    const row = createMockRow({ table, index: 0 });

    const result = getDeepestSubRowDepth(row);

    expect(result).toBe(3);
  });

  it('should return max depth from multiple branches', () => {
    const table = createMockTable({
      columns: [],
      data: [
        {
          id: 'row1',
          subRows: [
            {
              id: 'subrow1',
              subRows: [{ id: 'subsubrow1' }],
            },
            {
              id: 'subrow2',
              subRows: [
                {
                  id: 'subsubrow2',
                  subRows: [{ id: 'subsubsubrow2' }],
                },
              ],
            },
          ],
        },
      ],
    });

    const row = createMockRow({
      table,
      index: 0,
    });

    const result = getDeepestSubRowDepth(row);

    expect(result).toBe(3);
  });
});

describe('getSelectedReorderRowIds', () => {
  it('should return empty array when selection is undefined', () => {
    const result = getSelectedReorderRowIds(undefined);

    expect(result).toEqual([]);
  });

  it('should return empty array when all values are false', () => {
    const selection = {
      row1: false,
      row2: false,
      row3: false,
    };

    const result = getSelectedReorderRowIds(selection);

    expect(result).toEqual([]);
  });

  it('should return only selected row ids when some are true', () => {
    const selection = {
      row1: true,
      row2: false,
      row3: true,
    };

    const result = getSelectedReorderRowIds(selection);

    expect(result).toEqual(['row1', 'row3']);
  });

  it('should return all row ids when all values are true', () => {
    const selection = {
      row1: true,
      row2: true,
      row3: true,
    };

    const result = getSelectedReorderRowIds(selection);

    expect(result).toEqual(['row1', 'row2', 'row3']);
  });
});

describe('canInsertSelectedRowsWithoutExceedingMaxDepth', () => {
  it('should return false when selectedRows is empty', () => {
    const result = canInsertSelectedRowsWithoutExceedingMaxDepth({
      maxDepth: 3,
      selectedRows: [],
      targetRowDepth: 0,
    });

    expect(result).toBe(false);
  });

  it('should return true when maxDepth is undefined', () => {
    const table = createMockTable({
      columns: [],
      data: [
        {
          id: 'row1',
          subRows: [{ id: 'subrow1' }],
        },
      ],
    });
    const row = createMockRow({ table, index: 0 });

    const result = canInsertSelectedRowsWithoutExceedingMaxDepth({
      maxDepth: undefined,
      selectedRows: [row],
      targetRowDepth: 2,
    });

    expect(result).toBe(true);
  });

  it('should return true when move does not exceed maxDepth', () => {
    const table = createMockTable({
      columns: [],
      data: [
        {
          id: 'row1',
          subRows: [{ id: 'subrow1' }],
        },
      ],
    });
    const row = createMockRow({ table, index: 0 });

    // selectedRow depth = 0, deepest = 1, target depth = 1
    // newMaxDepth = 1 + 1 + (1 - 0) = 3, maxDepth = 4
    // 3 < 4 → true
    const result = canInsertSelectedRowsWithoutExceedingMaxDepth({
      maxDepth: 4,
      selectedRows: [row],
      targetRowDepth: 1,
    });

    expect(result).toBe(true);
  });

  it('should return false when move exceeds maxDepth', () => {
    const table = createMockTable({
      columns: [],
      data: [
        {
          id: 'parent',
          subRows: [
            {
              id: 'row1',
              subRows: [
                {
                  id: 'subrow1',
                  subRows: [{ id: 'subsubrow1' }],
                },
              ],
            },
          ],
        },
      ],
    });

    const row = getRowAtDepth(table, 1);

    // selectedRow depth = 1, deepest = 3, target depth = 2
    // newMaxDepth = 2 + 1 + (3 - 1) = 5, maxDepth = 4
    // 5 < 4 → false
    const result = canInsertSelectedRowsWithoutExceedingMaxDepth({
      maxDepth: 4,
      selectedRows: [row!],
      targetRowDepth: 2,
    });

    expect(result).toBe(false);
  });

  it('should calculate correctly with multiple selected rows', () => {
    const table1 = createMockTable({
      columns: [],
      data: [
        {
          id: 'row1',
          subRows: [{ id: 'subrow1' }],
        },
        {
          id: 'row2',
          subRows: [
            {
              id: 'subrow2',
              subRows: [{ id: 'subsubrow2' }],
            },
          ],
        },
        {
          id: 'row3',
          subRows: [
            {
              id: 'subrow3',
              subRows: [{ id: 'subsubrow3' }],
            },
          ],
        },
      ],
    });

    const row1 = createMockRow({ table: table1, index: 1 });
    const row2 = createMockRow({ table: table1, index: 2 });

    // row1: depth = 0, deepest = 1
    // row2: depth = 0, deepest = 2, minDepth = 0, maxDeepest = 2
    // target depth = 1
    // newMaxDepth = 1 + 1 + (2 - 0) = 4, maxDepth = 5
    // 4 < 5 → true
    const result = canInsertSelectedRowsWithoutExceedingMaxDepth({
      maxDepth: 5,
      selectedRows: [row1, row2],
      targetRowDepth: 1,
    });

    expect(result).toBe(true);
  });
});
