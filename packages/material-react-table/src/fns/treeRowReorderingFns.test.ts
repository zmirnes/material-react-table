import { describe, expect, it } from 'vitest';
import { MRT_Row, MRT_RowData } from '../types';
import {
  canInsertSelectedRowsWithoutExceedingMaxDepth,
  getDeepestSubRowDepth,
  getSelectedReorderRowIds,
} from './treeRowReorderingFns';

// Helper: creates a mock row with proper typing
interface MockRowOptions {
  id?: string;
  depth: number;
  subRows?: MockRowOptions[];
}

const createMockRow = (options: MockRowOptions): MRT_Row<MRT_RowData> => {
  return {
    id: options.id ?? `row-${Math.random()}`,
    depth: options.depth,
    subRows: options.subRows?.map(createMockRow),
  } as MRT_Row<MRT_RowData>;
};

describe('getDeepestSubRowDepth', () => {
  it('should return row depth when row has no subRows', () => {
    const row = createMockRow({ depth: 0 });

    const result = getDeepestSubRowDepth(row);

    expect(result).toBe(0);
  });

  it('should return row depth when row has undefined subRows', () => {
    const row = createMockRow({ depth: 0, subRows: [] });

    const result = getDeepestSubRowDepth(row);

    expect(result).toBe(0);
  });

  it('should return deepest depth from nested subRows', () => {
    const row = createMockRow({
      depth: 0,
      subRows: [
        {
          depth: 1,
          subRows: [
            {
              depth: 2,
              subRows: [
                {
                  depth: 3,
                  subRows: [],
                },
              ],
            },
          ],
        },
      ],
    });

    const result = getDeepestSubRowDepth(row);

    expect(result).toBe(3);
  });

  it('should return max depth from multiple branches', () => {
    const row = createMockRow({
      depth: 0,
      subRows: [
        {
          depth: 1,
          subRows: [
            {
              depth: 2,
              subRows: [],
            },
          ],
        },
        {
          depth: 1,
          subRows: [
            {
              depth: 2,
              subRows: [
                {
                  depth: 3,
                  subRows: [],
                },
              ],
            },
          ],
        },
      ],
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
    const row = createMockRow({
      id: 'row1',
      depth: 0,
      subRows: [{ depth: 1 }],
    });

    const result = canInsertSelectedRowsWithoutExceedingMaxDepth({
      maxDepth: undefined,
      selectedRows: [row],
      targetRowDepth: 2,
    });

    expect(result).toBe(true);
  });

  it('should return true when move does not exceed maxDepth', () => {
    const row = createMockRow({
      id: 'row1',
      depth: 0,
      subRows: [{ depth: 1 }],
    });

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
    const row = createMockRow({
      id: 'row1',
      depth: 1,
      subRows: [
        {
          depth: 2,
          subRows: [{ depth: 3 }],
        },
      ],
    });

    // selectedRow depth = 1, deepest = 3, target depth = 2
    // newMaxDepth = 2 + 1 + (3 - 1) = 5, maxDepth = 4
    // 5 < 4 → false
    const result = canInsertSelectedRowsWithoutExceedingMaxDepth({
      maxDepth: 4,
      selectedRows: [row],
      targetRowDepth: 2,
    });

    expect(result).toBe(false);
  });

  it('should calculate correctly with multiple selected rows', () => {
    const row1 = createMockRow({
      id: 'row1',
      depth: 0,
      subRows: [{ depth: 1 }],
    });

    const row2 = createMockRow({
      id: 'row2',
      depth: 0,
      subRows: [
        {
          depth: 1,
          subRows: [{ depth: 2 }],
        },
      ],
    });

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
