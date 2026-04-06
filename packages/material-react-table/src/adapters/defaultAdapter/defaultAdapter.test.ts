import { describe, it, expect } from 'vitest';
import {
  backendColumnsToTableColumns,
  backendColumnToTableColumn,
  getColumnsDimensions,
  getPaginationModel,
  getSortModel,
  initialStateToTableState,
  isDescSorted,
  mapMrtSizingToMuiDimensions,
  tableColumnToBackendColumn,
  tableStateToBackendState,
} from './defaultAdapter';
import type {
  GridColumnDimensions,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid-premium';
import type { GridColDef, InitialStateResponse } from './types';
import { initialStateMock } from './mockData';

// Is sorted by desc
describe('isDescSorted', () => {
  it('should return true if sort is desc', () => {
    const result = isDescSorted('desc');
    expect(result).toBe(true);
  });
  it('should return false if sort is asc', () => {
    const result = isDescSorted('asc');
    expect(result).toBe(false);
  });
  it('should return false if sort is null', () => {
    const result = isDescSorted(null);
    expect(result).toBe(false);
  });
});

// Get sort model
describe('getSortModel', () => {
  it('should return sorting state from sort model', () => {
    // Test with multiple sort fields, including null sort
    const sortModel: GridSortModel = [
      { field: 'name', sort: 'asc' },
      { field: 'age', sort: 'desc' },
      { field: 'email', sort: null },
    ];

    // Expected result should be an array of sorting state objects with correct id and desc values
    const result = getSortModel(sortModel);
    expect(result).toEqual([
      { id: 'name', desc: false },
      { id: 'age', desc: true },
      { id: 'email', desc: false },
    ]);
  });
});

// Get pagination model
describe('getPaginationModel', () => {
  it('should return pagination state from pagination object', () => {
    const pagination: Partial<GridPaginationModel> = {
      page: 1,
      pageSize: 10,
    };

    const result = getPaginationModel(pagination);
    expect(result).toEqual({ pageIndex: 1, pageSize: 10 });
  });
});

// Get columns dimensions
describe('getColumnsDimensions', () => {
  it('should return columns dimensions from dimensions object', () => {
    const dimensions: Record<string, GridColumnDimensions> = {
      fieldName: {
        flex: 1,
        width: 100,
        maxWidth: 200,
        minWidth: 50,
      },
    };

    const result = getColumnsDimensions(dimensions);
    expect(result).toEqual({
      fieldName: 100,
    });
  });
});

// Initial state to table state
describe('initialStateToTableState', () => {
  it('should transform complete backend state to tanstack table state', () => {
    const backendState: InitialStateResponse = { state: initialStateMock };
    const result = initialStateToTableState(backendState);
    expect(result).toEqual({
      sorting: getSortModel(backendState.state.sorting.sortModel),
      pagination: getPaginationModel(
        backendState.state.pagination.paginationModel,
      ),
      columnVisibility: backendState.state.columns.columnVisibilityModel,
      columnOrder: backendState.state.columns.orderedFields,
      columnSizing: getColumnsDimensions(
        backendState.state.columns.dimensions || {},
      ),
    });
  });
});

// Transform backend column definition to tanstack column definition
describe('transformColumnDefinition', () => {
  it('should transform backend column definition to tanstack column definition', () => {
    const backendColumnDefinition: GridColDef = initialStateMock.gridColDef[0];
    const result = backendColumnToTableColumn(backendColumnDefinition);

    const { accessorFn, Cell, ...rest } = result;

    expect(rest).toEqual({
      id: backendColumnDefinition.field,
      enableColumnFilter: backendColumnDefinition.filterable,
      enableGrouping: backendColumnDefinition.groupable,
      enableHiding: backendColumnDefinition.hideable,
      enableResizing: backendColumnDefinition.resizable,
      enableSorting: backendColumnDefinition.sortable,
      enablePinning: backendColumnDefinition.pinnable,
      maxSize: backendColumnDefinition.maxWidth,
      minSize: backendColumnDefinition.minWidth,
      size: backendColumnDefinition.width,
      type: backendColumnDefinition.type,
      header:
        backendColumnDefinition.headerName || backendColumnDefinition.field,
    });

    const mockRow = { [backendColumnDefinition.field]: 'test-value' };
    expect(accessorFn!(mockRow)).toBe('test-value');

    const mockCell = { cell: { getValue: () => 'hello' } };
    expect(Cell!(mockCell as any)).toBe('hello');
  });
});

// Transform backend columns to tanstack columns
describe('backendColumnsToTableColumns', () => {
  it('should transform backend columns to tanstack columns', () => {
    const backendColumns: GridColDef[] = initialStateMock.gridColDef;
    const result = backendColumnsToTableColumns(backendColumns);

    result.forEach((col, index) => {
      const backendCol = backendColumns[index];
      const { accessorFn, Cell, ...rest } = col;

      expect(rest).toEqual({
        id: backendCol.field,
        enableColumnFilter: backendCol.filterable,
        enableGrouping: backendCol.groupable,
        enableHiding: backendCol.hideable,
        enableResizing: backendCol.resizable,
        enableSorting: backendCol.sortable,
        enablePinning: backendCol.pinnable,
        maxSize: backendCol.maxWidth,
        minSize: backendCol.minWidth,
        size: backendCol.width,
        type: backendCol.type,
        header: backendCol.headerName || backendCol.field,
      });

      const mockRow = { [backendCol.field]: 'test-value' };
      expect(accessorFn!(mockRow)).toBe('test-value');

      const mockCell = { cell: { getValue: () => 'hello' } };
      expect(Cell!(mockCell as any)).toBe('hello');
    });
  });
});

describe('tableColumnToBackendColumn', () => {
  it('should transform a tanstack column definition back to a backend column definition', () => {
    const backendColumn: GridColDef = initialStateMock.gridColDef[0];
    const tanstackColumn = backendColumnToTableColumn(backendColumn);
    const result = tableColumnToBackendColumn(tanstackColumn);
    expect(result).toEqual({
      field: backendColumn.field,
      filterable: backendColumn.filterable,
      groupable: backendColumn.groupable,
      hideable: backendColumn.hideable,
      resizable: backendColumn.resizable,
      sortable: backendColumn.sortable,
      pinnable: backendColumn.pinnable,
      maxWidth: backendColumn.maxWidth,
      minWidth: backendColumn.minWidth,
      width: backendColumn.width,
      type: backendColumn.type,
      headerName: backendColumn.headerName || backendColumn.field,
    });
  });
});

describe('tableColumnsToBackendColumns', () => {
  it('should transform an array of tanstack column definitions back to an array of backend column definitions', () => {
    const backendColumns: GridColDef[] = initialStateMock.gridColDef;
    const tanstackColumns = backendColumns.map(backendColumnToTableColumn);
    const result = tanstackColumns.map(tableColumnToBackendColumn);
    expect(result).toEqual(
      backendColumns.map((col) => ({
        field: col.field,
        filterable: col.filterable,
        groupable: col.groupable,
        hideable: col.hideable,
        resizable: col.resizable,
        sortable: col.sortable,
        pinnable: col.pinnable,
        maxWidth: col.maxWidth,
        minWidth: col.minWidth,
        width: col.width,
        type: col.type,
        headerName: col.headerName || col.field,
      })),
    );
  });
});

describe('mapMrtSizingToMuiDimensions', () => {
  it('should map MRT column sizing to MUI column dimensions', () => {
    const backendColumns: GridColDef[] = initialStateMock.gridColDef;
    const mrtColumns = backendColumns.map(backendColumnToTableColumn);

    const result = mapMrtSizingToMuiDimensions(mrtColumns);
    expect(result).toEqual(
      mrtColumns.reduce(
        (acc, col) => {
          acc[col.id as string] = {
            width: col.size ?? 150,
            minWidth: col.minSize ?? 50,
            maxWidth: col.maxSize ?? -1,
            flex: 0,
          };
          return acc;
        },
        {} as Record<string, GridColumnDimensions>,
      ),
    );
  });
});

describe('tableStateToBackendState', () => {
  it('should transform tanstack table state to backend state', () => {
    const backendColumns: GridColDef[] = initialStateMock.gridColDef;
    const mrtColumns = backendColumns.map(backendColumnToTableColumn);

    const state = {
      columnOrder: initialStateMock.columns.orderedFields,
      pagination: {
        pageIndex: initialStateMock.pagination.paginationModel.page,
        pageSize: initialStateMock.pagination.paginationModel.pageSize,
      },
      sorting: [{ id: '__check__', desc: true }],
    };

    const additionalOptions = {
      density: 'comfortable',
      columnVisibility: initialStateMock.columns.columnVisibilityModel,
    };

    const result = tableStateToBackendState(
      state,
      mrtColumns,
      additionalOptions,
    );
    expect(result).toEqual({
      state: {
        columns: {
          columnVisibilityModel: additionalOptions.columnVisibility,
          orderedFields: state.columnOrder,
          dimensions: mapMrtSizingToMuiDimensions(mrtColumns),
        },
        density: additionalOptions.density,
        gridColDef: mrtColumns.map(tableColumnToBackendColumn),
        pageSizeOptions: [10, 25, 50, 100],
        pagination: {
          paginationModel: {
            page: state.pagination.pageIndex,
            pageSize: state.pagination.pageSize,
          },
        },
        quickFilters: [],
        sorting: {
          sortModel: [{ field: '__check__', sort: 'desc' }],
        },
      },
    });
  });
});
