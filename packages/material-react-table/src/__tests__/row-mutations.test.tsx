import { act, renderHook, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { useMaterialReactTable } from '../hooks/useMaterialReactTable';
import { type MRT_ColumnDef } from '../types';

type TestRow = {
  id: string;
  firstName: string;
};

const columns: MRT_ColumnDef<TestRow>[] = [
  {
    accessorKey: 'firstName',
    header: 'First Name',
    type: 'string',
  },
];

const makeRows = (): TestRow[] => [
  { id: '1', firstName: 'Alice' },
  { id: '2', firstName: 'Bob' },
  { id: '3', firstName: 'Charlie' },
];

describe('row mutation methods', () => {
  it('setRows delegates to onDataChange updater', async () => {
    const { result } = renderHook(() => {
      const [data, setData] = useState<TestRow[]>(makeRows());
      const table = useMaterialReactTable<TestRow>({
        columns,
        data,
        onDataChange: setData,
      });

      return { table, data };
    });

    act(() => {
      result.current.table.setRows((previousRows) => [
        ...previousRows,
        { id: '4', firstName: 'Diana' },
      ]);
    });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(4);
      expect(result.current.data[3].firstName).toBe('Diana');
    });
  });

  it('addRow prepends and keeps page size on first page when manual pagination is enabled', async () => {
    const { result } = renderHook(() => {
      const [data, setData] = useState<TestRow[]>(makeRows());
      const table = useMaterialReactTable<TestRow>({
        columns,
        data,
        onDataChange: setData,
        manualPagination: true,
        initialState: {
          pagination: {
            pageIndex: 0,
            pageSize: 2,
          },
        },
      });

      return { table, data };
    });

    act(() => {
      result.current.table.addRow({ id: '4', firstName: 'Diana' });
    });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data[0].firstName).toBe('Diana');
      expect(result.current.data[1].firstName).toBe('Alice');
    });
  });

  it('updateRow updates only matching id', async () => {
    const { result } = renderHook(() => {
      const [data, setData] = useState<TestRow[]>(makeRows());
      const table = useMaterialReactTable<TestRow>({
        columns,
        data,
        onDataChange: setData,
      });

      return { table, data };
    });

    act(() => {
      result.current.table.updateRow({
        id: '2',
        firstName: 'Bob Updated',
      });
    });

    await waitFor(() => {
      expect(result.current.data[0].firstName).toBe('Alice');
      expect(result.current.data[1].firstName).toBe('Bob Updated');
      expect(result.current.data[2].firstName).toBe('Charlie');
    });
  });

  it('upsertRow updates existing and inserts missing id', async () => {
    const { result } = renderHook(() => {
      const [data, setData] = useState<TestRow[]>(makeRows());
      const table = useMaterialReactTable<TestRow>({
        columns,
        data,
        onDataChange: setData,
      });

      return { table, data };
    });

    act(() => {
      result.current.table.upsertRow({
        id: '2',
        firstName: 'Bob Upserted',
      });
    });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(3);
      expect(result.current.data[1].firstName).toBe('Bob Upserted');
    });

    act(() => {
      result.current.table.upsertRow({
        id: '9',
        firstName: 'New Row',
      });
    });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(4);
      expect(result.current.data[0]).toEqual({
        id: '9',
        firstName: 'New Row',
      });
    });
  });
});
