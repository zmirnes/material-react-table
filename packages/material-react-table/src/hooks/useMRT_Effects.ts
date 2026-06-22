import { useEffect, useReducer, useRef } from 'react';
import {
  type MRT_RowData,
  type MRT_SortingState,
  type MRT_TableInstance,
} from '../types';
import { getDefaultColumnOrderIds } from '../utils/displayColumn.utils';
import { getCanRankRows } from '../utils/row.utils';

export const useMRT_Effects = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
) => {
  const {
    getIsSomeRowsPinned,
    getPrePaginationRowModel,
    getState,
    options: { enablePagination, enableRowPinning, rowCount },
  } = table;
  const {
    columnOrder,
    density,
    globalFilter,
    isLoading,
    pagination,
    showSkeletons,
    sorting,
  } = getState();

  const totalColumnCount = table.options.columns.length;
  const totalRowCount = rowCount ?? getPrePaginationRowModel().rows.length;

  const rerender = useReducer(() => ({}), {})[1];
  const initialBodyHeight = useRef<string>(null);
  const hasMountedColumnOrderEffect = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initialBodyHeight.current = document.body.style.height;
    }
  }, []);

  //recalculate column order when columns change or features are toggled on/off
  useEffect(() => {
    if (!hasMountedColumnOrderEffect.current) {
      hasMountedColumnOrderEffect.current = true;
      return;
    }

    if (totalColumnCount !== columnOrder.length) {
      table.setColumnOrder(getDefaultColumnOrderIds(table.options));
    }
  }, [totalColumnCount]);

  //if page index is out of bounds, set it to the last page
  useEffect(() => {
    if (!enablePagination || isLoading || showSkeletons) return;
    const { pageIndex, pageSize } = pagination;
    const totalPages: number =
      totalRowCount > 0 ? Math.ceil(totalRowCount / pageSize) : 1;
    const isOutOfBounds: boolean = pageIndex < 0 || pageIndex >= totalPages;

    if (isOutOfBounds) {
      table.setPageIndex(totalPages - 1);
    }
  }, [totalRowCount, enablePagination, isLoading, showSkeletons]);

  //turn off sort when global filter is looking for ranked results
  const appliedSort = useRef<MRT_SortingState>(sorting);
  useEffect(() => {
    if (sorting.length) {
      appliedSort.current = sorting;
    }
  }, [sorting]);

  useEffect(() => {
    if (!getCanRankRows(table)) return;
    if (globalFilter) {
      table.setSorting([]);
    } else {
      table.setSorting(() => appliedSort.current || []);
    }
  }, [globalFilter]);

  //fix pinned row top style when density changes
  useEffect(() => {
    if (enableRowPinning && getIsSomeRowsPinned()) {
      setTimeout(() => {
        rerender();
      }, 150);
    }
  }, [density]);
};
