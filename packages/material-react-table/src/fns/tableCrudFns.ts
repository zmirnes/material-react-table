import type { Dispatch, SetStateAction } from 'react';
import {
  type MRT_GetRowId,
  type MRT_Row,
  type MRT_RowData,
  type MRT_RowManipulationInput,
} from '../types';

type MRT_TableCrudHandlerContext<TData extends MRT_RowData> = {
  getRowId?: MRT_GetRowId<TData>;
  pageSize?: number;
  setRowsState: Dispatch<SetStateAction<TData[]>>;
};

// Keeps the local rows array from growing past the current page size. New rows are
// inserted at the front, so overflow is trimmed off the tail (the oldest existing
// rows), since the local state is expected to be reconciled with the source of
// truth on the next fetch.
const capRowsToPageSize = <TData extends MRT_RowData>(
  rows: TData[],
  pageSize?: number,
): TData[] =>
  pageSize && rows.length > pageSize ? rows.slice(0, pageSize) : rows;

const normalizeRowInput = <TData extends MRT_RowData>(
  rowInput: MRT_RowManipulationInput<TData>,
): TData[] => (Array.isArray(rowInput) ? rowInput : [rowInput]);

const getResolvedRowId = <TData extends MRT_RowData>(
  row: TData,
  index: number,
  parentRow: MRT_Row<TData> | undefined,
  getRowId?: MRT_GetRowId<TData>,
): string | undefined => {
  const customRowId = getRowId?.(row, index, parentRow);

  if (customRowId !== undefined) {
    return String(customRowId);
  }

  if ('id' in row && (typeof row.id === 'string' || typeof row.id === 'number'))
    return String(row.id);

  return undefined;
};

export const handleAddRow = <TData extends MRT_RowData>({
  pageSize,
  setRowsState,
}: MRT_TableCrudHandlerContext<TData>) => {
  return (rowInput: MRT_RowManipulationInput<TData>): void => {
    const rowsToAdd = normalizeRowInput(rowInput);

    const hasValidRowIds = rowsToAdd.every((row, index) => {
      const rowId = getResolvedRowId(row, index, undefined, undefined);
      return rowId !== undefined;
    });

    if (!hasValidRowIds) {
      throw new Error(
        'Each row must have a valid `id` property or a `getRowId` function must be provided to generate unique IDs.',
      );
    }

    setRowsState((previousRows) =>
      capRowsToPageSize([...rowsToAdd, ...previousRows], pageSize),
    );
  };
};

export const handleUpdateRow = <TData extends MRT_RowData>({
  getRowId,
  setRowsState,
}: MRT_TableCrudHandlerContext<TData>) => {
  return (
    rowInput: MRT_RowManipulationInput<Partial<TData> & { id: string }>,
  ): void => {
    const rowsToUpdate = normalizeRowInput(rowInput);

    setRowsState((previousRows) => {
      if (!rowsToUpdate.length) return previousRows;

      const rowById = new Map<string, Partial<TData> & { id: string }>();
      rowsToUpdate.forEach((row) => {
        rowById.set(row.id, row);
      });

      return previousRows.map((row, index) => {
        const rowId = getResolvedRowId(row, index, undefined, getRowId);
        const updatedRow = rowId !== undefined ? rowById.get(rowId) : undefined;
        return updatedRow !== undefined ? { ...row, ...updatedRow } : row;
      });
    });
  };
};

export const handleSetRows = <TData extends MRT_RowData>({
  setRowsState,
}: MRT_TableCrudHandlerContext<TData>) => {
  return (rowInput: MRT_RowManipulationInput<TData>): void => {
    setRowsState(normalizeRowInput(rowInput));
  };
};

export const handleUpsertRow = <TData extends MRT_RowData>({
  getRowId,
  pageSize,
  setRowsState,
}: MRT_TableCrudHandlerContext<TData>) => {
  return (
    rowInput: MRT_RowManipulationInput<Partial<TData> & { id: string }>,
  ): void => {
    const rowsToUpsert = normalizeRowInput(rowInput);

    setRowsState((previousRows) => {
      if (!rowsToUpsert.length) return previousRows;

      const nextRows = [...previousRows];
      const indexByRowId = new Map<string, number>();

      previousRows.forEach((row, index) => {
        const rowId = getResolvedRowId(row, index, undefined, getRowId);
        if (rowId !== undefined) {
          indexByRowId.set(rowId, index);
        }
      });

      const rowsToInsert: TData[] = [];

      rowsToUpsert.forEach((row) => {
        const existingIndex = indexByRowId.get(row.id);

        if (existingIndex === undefined) {
          rowsToInsert.push(row as unknown as TData);
          return;
        }

        nextRows[existingIndex] = { ...nextRows[existingIndex], ...row };
      });

      return capRowsToPageSize([...rowsToInsert, ...nextRows], pageSize);
    });
  };
};

export const handleRemoveRow = <TData extends MRT_RowData>({
  getRowId,
  setRowsState,
}: MRT_TableCrudHandlerContext<TData>) => {
  return (rowInput: string | string[]): void => {
    const rowsToRemove = Array.isArray(rowInput) ? rowInput : [rowInput];

    setRowsState((previousRows) => {
      if (!rowsToRemove.length) return previousRows;

      const rowIdsToRemove = new Set<string>();
      rowsToRemove.forEach((rowId) => {
        if (rowId !== undefined) {
          rowIdsToRemove.add(rowId);
        }
      });

      return previousRows.filter(
        (row, index) =>
          !rowIdsToRemove.has(
            getResolvedRowId(row, index, undefined, getRowId) ?? '',
          ),
      );
    });
  };
};
