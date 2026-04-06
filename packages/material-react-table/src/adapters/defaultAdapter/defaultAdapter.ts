/** Currently we have: backend state that we transform to MUI State, that state is initial state from our backend. In our new case we must transform backend state to tanstack table state.
 * We also have mui state that we must prepare for backend, in our new case we must prepare tanstack table state for backend.
 * So we have two transformations: backend state to tanstack table state, and tanstack table state to backend state.
 * Also, we have data that we receive from backend and we must transform it to tanstack table data.
 * */
import type {
  PaginationState,
  SortingState,
  TableState,
} from '@tanstack/react-table';
import type {
  GridColumnDimensions,
  GridPaginationModel,
  GridRowId,
  GridSortModel,
  GridValidRowModel,
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
export const getColumnsFromBackendState = ({ state }: InitialStateResponse) => {
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

export function tableColumnToBackendColumn<
  TData extends Record<string, unknown>,
>(column: ColumnDefinition<TData>): GridColDef {
  return {
    field: column.id as string,
    filterable: column.enableColumnFilter,
    groupable: column.enableGrouping,
    hideable: column.enableHiding,
    resizable: column.enableResizing,
    sortable: column.enableSorting,
    pinnable: column.enablePinning,
    maxWidth: column.maxSize,
    minWidth: column.minSize,
    width: column.size,
    type: column.type,
    headerName: column.header,
  };
}
export const backendColumnsToTableColumns = <RowType extends GridValidRowModel>(
  columns: GridColDef[],
): ColumnDefinition<RowType>[] => {
  return columns.map((col) => backendColumnToTableColumn<RowType>(col));
};

export const tableColumnsToBackendColumns = <RowType extends GridValidRowModel>(
  columns: ColumnDefinition<RowType>[],
): GridColDef[] => {
  return columns.map((col) => tableColumnToBackendColumn<RowType>(col));
};
// Transform tanstack table sorting state to backend sort model
export const tableStateToSortModel = (sorting: SortingState): GridSortModel => {
  return sorting.map((sort) => ({
    field: sort.id,
    sort: sort.desc ? 'desc' : 'asc',
  }));
};

const getPageSizeOptions = () => [10, 25, 50, 100];
// Transform selected rows ids array to tanstack table row selection state
export const selectedRowsToRowSelection = (selectedRows: GridRowId[]) => {
  const rowSelection: Record<string, boolean> = {};
  selectedRows.forEach((rowId) => {
    rowSelection[rowId] = true;
  });
  return rowSelection;
};

type MuiColumnDimension = {
  width: number;
  minWidth: number;
  maxWidth: number;
  flex: number;
};
export const mapMrtSizingToMuiDimensions = <
  TData extends Record<string, unknown>,
>(
  columnSizing: Record<string, number>,
  columns: ColumnDefinition<TData>[],
): Record<string, MuiColumnDimension> => {
  return Object.fromEntries(
    columns.map((col) => {
      const key = col.id as string;
      return [
        key,
        {
          width: columnSizing[key] ?? col.size ?? 150,
          minWidth: col.minSize ?? 50,
          maxWidth: col.maxSize ?? -1,
          flex: 0,
        },
      ];
    }),
  );
};
// Transform tanstack table state to backend state
export const tableStateToBackendState = <TData extends Record<string, unknown>>(
  state: Partial<TableState> & {
    columnSizing?: Record<string, number>;
    columnOrder?: string[];
  },
  columns: ColumnDefinition<TData>[],
  additionalOptions: {
    density: string;
    columnVisibility: Record<string, boolean>;
  },
) => {
  return {
    state: {
      columns: {
        columnVisibilityModel: additionalOptions.columnVisibility,
        orderedFields: state.columnOrder ?? [],
        dimensions: mapMrtSizingToMuiDimensions(
          state.columnSizing ?? {},
          columns,
        ),
      },
      density: additionalOptions.density,
      gridColDef: columns.map((col: ColumnDefinition<TData>) =>
        tableColumnToBackendColumn(col),
      ),
      pageSizeOptions: getPageSizeOptions(),
      pagination: {
        paginationModel: {
          page: state.pagination?.pageIndex,
          pageSize: state.pagination?.pageSize,
        },
      },
      quickFilters: [],
      sorting: {
        sortModel: state.sorting ? tableStateToSortModel(state.sorting) : [],
      },
    },
  };
};
