import { describe, it, expect } from "vitest";
import {
  backendColumnsToTableColumns,
  backendColumnToTableColumn,
  getColumnsDimensions,
  getPaginationModel,
  getSortModel,
  initialStateToTableState,
  isDescSorted,
} from "./defaultAdapter";
import type {
  GridColumnDimensions,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid-premium";
import type { GridColDef, InitialStateResponse } from "./types";
import { initialStateMock } from "./mockData";

// Is sorted by desc
describe("isDescSorted", () => {
  it("should return true if sort is desc", () => {
    const result = isDescSorted("desc");
    expect(result).toBe(true);
  });
  it("should return false if sort is asc", () => {
    const result = isDescSorted("asc");
    expect(result).toBe(false);
  });
  it("should return false if sort is null", () => {
    const result = isDescSorted(null);
    expect(result).toBe(false);
  });
});

// Get sort model
describe("getSortModel", () => {
  it("should return sorting state from sort model", () => {
    // Test with multiple sort fields, including null sort
    const sortModel: GridSortModel = [
      { field: "name", sort: "asc" },
      { field: "age", sort: "desc" },
      { field: "email", sort: null },
    ];

    // Expected result should be an array of sorting state objects with correct id and desc values
    const result = getSortModel(sortModel);
    expect(result).toEqual([
      { id: "name", desc: false },
      { id: "age", desc: true },
      { id: "email", desc: false },
    ]);
  });
});

// Get pagination model
describe("getPaginationModel", () => {
  it("should return pagination state from pagination object", () => {
    const pagination: Partial<GridPaginationModel> = {
      page: 1,
      pageSize: 10,
    };

    const result = getPaginationModel(pagination);
    expect(result).toEqual({ pageIndex: 1, pageSize: 10 });
  });
});

// Get columns dimensions
describe("getColumnsDimensions", () => {
  it("should return columns dimensions from dimensions object", () => {
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
describe("initialStateToTableState", () => {
  it("should transform complete backend state to tanstack table state", () => {
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
describe("transformColumnDefinition", () => {
  it("should transform backend column definition to tanstack column definition", () => {
    const backendColumnDefinition: GridColDef = initialStateMock.gridColDef[0];
    const result = backendColumnToTableColumn(backendColumnDefinition);
    expect(result).toEqual({
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
    });
  });
});

// Transform backend columns to tanstack columns
describe("backendColumnsToTableColumns", () => {
  it("should transform backend columns to tanstack columns", () => {
    const backendColumns: GridColDef[] = initialStateMock.gridColDef;
    const result = backendColumnsToTableColumns(backendColumns);
    expect(result).toEqual(
      backendColumns.map((col) => backendColumnToTableColumn(col)),
    );
  });
});
