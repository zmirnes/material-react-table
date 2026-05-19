import { useMaterialReactTable } from '../../hooks/useMaterialReactTable';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

type TestData = {
  id: string;
  name: string;
};

describe('tableCrudFns', () => {
  it('should add rows correctly', () => {
    const { result } = renderHook(() =>
      useMaterialReactTable<TestData>({
        columns: [],
        data: [],
        getRowId: (originalRow) => originalRow.id,
      }),
    );
    const { addRow } = result.current;

    act(() => {
      addRow({ id: '1', name: 'Test Row' });
    });

    const rowsAfterAdd = result.current.getRowModel().rows;
    expect(rowsAfterAdd).toHaveLength(1);
    expect(rowsAfterAdd[0].original).toEqual({ id: '1', name: 'Test Row' });
  });

  it('should update rows correctly', () => {
    const initialData: TestData[] = [{ id: '1', name: 'Test Row' }];
    const { result } = renderHook(() =>
      useMaterialReactTable<TestData>({
        columns: [],
        data: initialData,
        getRowId: (originalRow) => originalRow.id,
      }),
    );
    const { updateRow } = result.current;

    act(() => {
      updateRow({ id: '1', name: 'Updated Row' });
    });

    const rowsAfterUpdate = result.current.getRowModel().rows;
    expect(rowsAfterUpdate).toHaveLength(1);
    expect(rowsAfterUpdate[0].original).toEqual({
      id: '1',
      name: 'Updated Row',
    });
  });

  it('should remove rows correctly', () => {
    const initialData: TestData[] = [
      { id: '1', name: 'Test Row 1' },
      { id: '2', name: 'Test Row 2' },
    ];
    const { result } = renderHook(() =>
      useMaterialReactTable<TestData>({
        columns: [],
        data: initialData,
        getRowId: (originalRow) => originalRow.id,
      }),
    );
    const { removeRow } = result.current;

    act(() => {
      removeRow('1');
    });

    const rowsAfterDelete = result.current.getRowModel().rows;
    expect(rowsAfterDelete).toHaveLength(1);
    expect(rowsAfterDelete[0].original).toEqual({
      id: '2',
      name: 'Test Row 2',
    });
  });

  it('should throw an error when adding a row without a valid ID', () => {
    const { result } = renderHook(() =>
      useMaterialReactTable<TestData>({
        columns: [],
        data: [],
        getRowId: (originalRow) => originalRow.id,
      }),
    );
    const { addRow } = result.current;

    expect(() => {
      addRow({ name: 'Invalid Row' } as TestData);
    }).toThrow(
      'Each row must have a valid `id` property or a `getRowId` function must be provided to generate unique IDs.',
    );
  });

  it('should update rows when using upsertRow', () => {
    const initialData: TestData[] = [{ id: '1', name: 'Test Row' }];
    const { result } = renderHook(() =>
      useMaterialReactTable<TestData>({
        columns: [],
        data: initialData,
        getRowId: (originalRow) => originalRow.id,
      }),
    );
    const { upsertRow } = result.current;

    act(() => {
      upsertRow({ id: '1', name: 'Updated Row' });
    });

    let rowsAfterUpsert = result.current.getRowModel().rows;
    expect(rowsAfterUpsert).toHaveLength(1);
    expect(rowsAfterUpsert[0].original).toEqual({
      id: '1',
      name: 'Updated Row',
    });
  });

  it('should add rows when using upsertRow with new data', () => {
    const initialData: TestData[] = [{ id: '1', name: 'Test Row' }];
    const { result } = renderHook(() =>
      useMaterialReactTable<TestData>({
        columns: [],
        data: initialData,
        getRowId: (originalRow) => originalRow.id,
      }),
    );
    const { upsertRow } = result.current;

    act(() => {
      upsertRow({ id: '2', name: 'New Row' });
    });

    const rowsAfterUpsert = result.current.getRowModel().rows;
    expect(rowsAfterUpsert).toHaveLength(2);
    expect(rowsAfterUpsert[1].original).toEqual({
      id: '2',
      name: 'New Row',
    });
  });
});
