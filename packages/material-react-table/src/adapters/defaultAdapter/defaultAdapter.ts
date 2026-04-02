/** Currently we have: backend state that we transform to MUI State, that state is initial state from our backend. In our new case we must transform backend state to tanstack table state.
 * We also have mui state that we must prepare for backend, in our new case we must prepare tanstack table state for backend.
 * So we have two transformations: backend state to tanstack table state, and tanstack table state to backend state.
 * Also, we have data that we receive from backend and we must transform it to tanstack table data.
 * */
import type { PaginationState, SortingState, TableState, } from '@tanstack/react-table';
import type {
  GridColumnDimensions,
  GridPaginationModel,
  GridRowId,
  GridSortModel,
  GridValidRowModel
} from '@mui/x-data-grid-premium';
import { ColumnDefinition } from '../../types';
import { GridColDef, InitialStateResponse } from './types';

// Get sort model
  export const isDescSorted = (sort: string | null | undefined) =>
    sort === 'desc';
  export const getSortModel = (sortModel: GridSortModel): SortingState => {
    return sortModel.map((sort) => ({
      id: sort.field,
      desc: isDescSorted(sort.sort),
    }));
  };

  // Get pagination model
  export const getPaginationModel = (
    pagination: Partial<GridPaginationModel> | undefined,
  ): PaginationState | undefined => {
    if (!pagination?.page || !pagination?.pageSize) return undefined;
    return { pageIndex: pagination.page, pageSize: pagination.pageSize };
  };

  // Get columns dimensions
  export const getColumnsDimensions = (
    dimensions: Record<string, GridColumnDimensions>,
  ) => {
    // We need to transform the dimensions object to a format that tanstack table can understand, which is a record of field name to width
    const dimensionsEntries = Object.entries(dimensions);

    // Reduce the dimensions entries to a record of field name to width, but only include entries that have a width defined
    return dimensionsEntries.reduce(
      (acc, [field, dimensions]) => {
        if (!dimensions.width) return acc;
        acc[field] = dimensions.width;
        return acc;
      },
      {} as Record<string, number>,
    );
  };

  // Transform backend state to tanstack table state
  export const initialStateToTableState = ({
    state,
  }: InitialStateResponse): Partial<TableState> => {
    return {
      sorting: getSortModel(state.sorting.sortModel),
      pagination: getPaginationModel(state.pagination.paginationModel),
      columnVisibility: state.columns.columnVisibilityModel,
      columnOrder: state.columns.orderedFields,
      columnSizing: getColumnsDimensions(state.columns.dimensions || {}),
    };
  };

  // Get collumns from backend state
  export const getColumnsFromBackendState = ({
    state,
  }: InitialStateResponse) => {
    return state.gridColDef;
  };

  // Backend columns to tanstack table columns
  // TODO: Unknown is used here because we don't know the type of the data that will be in the table, we can make it generic later when we have more information about the data
  export function backendColumnToTableColumn<
    TData extends Record<string, unknown>,
  >(col: GridColDef): ColumnDefinition<TData> {
    return {
      id: col.field,
      enableColumnFilter: col.filterable,
      enableGrouping: col.groupable,
      enableHiding: col.hideable,
      enableResizing: col.resizable,
      enableSorting: col.sortable,
      enablePinning: col.pinnable,
      maxSize: col.maxWidth,
      minSize: col.minWidth,
      size: col.width,
      type: col.type,
      header: col.headerName || col.field,
      accessorFn: (row) => row[col.field],
      Cell: (info) => {
        const value = info.cell.getValue();
        if (value === null || value === undefined) {
          return '';
        }
        return String(value);
      },
    };
  }

  export const backendColumnsToTableColumns = <
    RowType extends GridValidRowModel,
  >(
    columns: GridColDef[],
  ): ColumnDefinition<RowType>[] => {
    return columns.map((col) => backendColumnToTableColumn<RowType>(col));
  };

  // Transform selected rows ids array to tanstack table row selection state
  export const selectedRowsToRowSelection = (selectedRows: GridRowId[]) => {
    const rowSelection: Record<string, boolean> = {};
    selectedRows.forEach((rowId) => {
      rowSelection[rowId] = true;
    });
    return rowSelection;
  };

  // Transform tanstack table state to backend state
  export const tableStateToBackendState = () => {};
