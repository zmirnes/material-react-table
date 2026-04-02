import type {
  GridColumnsInitialState,
  GridDensity,
  GridFilterItem,
  GridLogicOperator,
  GridPaginationInitialState,
  GridRowId,
  GridRowModel,
  GridSortingState,
  GridColDef as MuiGridColDef,
} from "@mui/x-data-grid-premium";

// Density types for the default adapter
export type TableDensity = GridDensity;

// Extra field filter
export interface ExtraFieldFilter {
  field: string;
  type: string;
}

export interface GridColDef extends Omit<MuiGridColDef, "type"> {
  type: string;
  extraFieldFilters?: ExtraFieldFilter[];
}

// Interface for export formats
export interface IDataGridExport {
  formats: string[];
  label: string;
  name: string;
}

// Interface for saved filters
export interface ISavedFilter {
  name: string;
  logicOperator: GridLogicOperator;
  value: GridFilterItem[];
}

// Interface for a collection of saved filters
export interface ISavedFilters {
  [filterName: string]: ISavedFilter;
}

// Interface for the exports state
export interface IExportsState {
  selectedExports: string[];
  selectedFormat: string | null;
  grouped: boolean;
  availableExports: Record<string, IDataGridExport>;
}

// Interface for the initial state response from the backend
export interface InitialStateResponse {
  state: {
    columns: GridColumnsInitialState;
    density: TableDensity;
    gridColDef: GridColDef[];
    pagination: GridPaginationInitialState;
    sorting: GridSortingState;
    pageSizeOptions: number[];
    availableExports?: Record<string, IDataGridExport>;
    quickFilters?: GridFilterItem[];
    savedFilters?: ISavedFilters;
    activeExports?: Omit<IExportsState, "availableExports">;
  };
}

// Backend response data

export interface IGridDataResponseRow {
  data: GridRowModel;
  isExpanded: boolean;
  isOdd: boolean;
  isSelectable: boolean;
  rowId: number;
  isForcedByChildren?: boolean;
  isSelected: boolean;
  hierarchy?: string[];
}

export interface IGridDataResponse {
  rows: IGridDataResponseRow[];
  totalRows: number;
  allSelectableRows?: GridRowId[];
  additionalData?: Record<string, unknown>;
  selectedRows: GridRowId[];
  hasNextPage: boolean;
}
