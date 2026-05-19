import {
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from 'react';
import type { RegisterOptions, UseFormReturn } from 'react-hook-form';
import {
  type AccessorFn,
  type AggregationFn,
  type Cell,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingInfoState,
  type ColumnSizingState,
  type DeepKeys,
  type DeepValue,
  type ExpandedState,
  type FilterFn,
  type GroupingState,
  type Header,
  type HeaderGroup,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingFn,
  type SortingState,
  type Table,
  type TableOptions,
  type TableState,
  type Updater,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  type VirtualItem,
  type Virtualizer,
  type VirtualizerOptions,
} from '@tanstack/react-virtual';
import { type ModalProps, type StackProps, type SxProps } from '@mui/material';
import { type AlertProps } from '@mui/material/Alert';
import { type AutocompleteProps } from '@mui/material/Autocomplete';
import { type BoxProps } from '@mui/material/Box';
import { type ButtonProps } from '@mui/material/Button';
import { type CheckboxProps } from '@mui/material/Checkbox';
import { type ChipProps } from '@mui/material/Chip';
import { type CircularProgressProps } from '@mui/material/CircularProgress';
import { type DialogProps } from '@mui/material/Dialog';
import { type IconButtonProps } from '@mui/material/IconButton';
import { type LinearProgressProps } from '@mui/material/LinearProgress';
import { type PaginationProps } from '@mui/material/Pagination';
import { type PaperProps } from '@mui/material/Paper';
import { type RadioProps } from '@mui/material/Radio';
import { type SelectProps } from '@mui/material/Select';
import { type SkeletonProps } from '@mui/material/Skeleton';
import { type SliderProps } from '@mui/material/Slider';
import { type Theme } from '@mui/material/styles';
import { type TableProps } from '@mui/material/Table';
import { type TableBodyProps } from '@mui/material/TableBody';
import { type TableCellProps } from '@mui/material/TableCell';
import { type TableContainerProps } from '@mui/material/TableContainer';
import { type TableFooterProps } from '@mui/material/TableFooter';
import { type TableHeadProps } from '@mui/material/TableHead';
import { type TableRowProps } from '@mui/material/TableRow';
import { type TextFieldProps } from '@mui/material/TextField';
import {
  type DatePickerProps,
  type DateTimePickerProps,
  type TimePickerProps,
} from '@mui/x-date-pickers';
import { type MRT_AggregationFns } from './fns/aggregationFns';
import { type MRT_FilterFns } from './fns/filterFns';
import { type MRT_SortingFns } from './fns/sortingFns';
import { type MRT_Icons } from './icons';
import {
  type Action,
  type OnDeleteActionContext,
  type OnEditActionContext,
} from './types/actions/actions.types';

export type { MRT_Icons };
export type LiteralUnion<T extends U, U = string> =
  | T
  | (U & Record<never, never>);

export type Prettify<T> = { [K in keyof T]: T[K] } & unknown;

export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export type Xor<A, B> =
  | Prettify<A & { [k in keyof B]?: never }>
  | Prettify<B & { [k in keyof A]?: never }>;

export type DropdownOption =
  | {
      label?: string;
      // Intentional unknown — dropdown values can be any scalar type (string, number, object).
      // Consumers are expected to know and narrow the value type at usage sites.
      value: unknown;
    }
  | string;

export type MRT_DensityState = 'comfortable' | 'compact' | 'spacious';

export type MRT_ColumnFilterFnsState = Record<string, MRT_FilterOption>;
export type MRT_FiltersLogicOperator = 'and' | 'or';

// Record<string, unknown> is used as a generic constraint (TData extends MRT_RowData).
// unknown is intentional — it allows any concrete row type (e.g. { name: string; age: number })
// to satisfy the constraint without requiring an explicit index signature.
export type MRT_RowData = Record<string, unknown>;

export type MRT_ColumnFiltersState = ColumnFiltersState;
export type MRT_ColumnOrderState = ColumnOrderState;
export type MRT_ColumnPinningState = ColumnPinningState;
export type MRT_ColumnSizingInfoState = ColumnSizingInfoState;
export type MRT_ColumnSizingState = ColumnSizingState;
export type MRT_ExpandedState = ExpandedState;
export type MRT_GroupingState = GroupingState;
export type MRT_PaginationState = PaginationState;
export type MRT_RowSelectionState = RowSelectionState;
export type MRT_SortingState = SortingState;
export type MRT_Updater<T> = Updater<T>;
export type MRT_VirtualItem = VirtualItem;
export type MRT_VisibilityState = VisibilityState;

export type MRT_VirtualizerOptions<
  TScrollElement extends Element | Window = Element | Window,
  TItemElement extends Element = Element,
> = VirtualizerOptions<TScrollElement, TItemElement>;

export type MRT_ColumnVirtualizer<
  TScrollElement extends Element | Window = HTMLDivElement,
  TItemElement extends Element = HTMLTableCellElement,
> = Virtualizer<TScrollElement, TItemElement> & {
  virtualColumns: MRT_VirtualItem[];
  virtualPaddingLeft?: number;
  virtualPaddingRight?: number;
};

export type MRT_RowVirtualizer<
  TScrollElement extends Element | Window = HTMLDivElement,
  TItemElement extends Element = HTMLTableRowElement,
> = Virtualizer<TScrollElement, TItemElement> & {
  virtualRows: MRT_VirtualItem[];
};

export type MRT_ColumnHelper<TData extends MRT_RowData> = {
  accessor: <
    TAccessor extends AccessorFn<TData> | DeepKeys<TData>,
    TValue extends TAccessor extends AccessorFn<TData, infer TReturn>
      ? TReturn
      : TAccessor extends DeepKeys<TData>
        ? DeepValue<TData, TAccessor>
        : never,
  >(
    accessor: TAccessor,
    column: MRT_DisplayColumnDef<TData, TValue>,
  ) => MRT_ColumnDef<TData, TValue>;
  display: (column: MRT_DisplayColumnDef<TData>) => MRT_ColumnDef<TData>;
  group: (column: MRT_GroupColumnDef<TData>) => MRT_ColumnDef<TData>;
};

export interface MRT_Localization {
  // language of the localization as BCP 47 language tag for number formatting
  language: string;
  actions: string;
  and: string;
  cancel: string;
  changeFilterMode: string;
  changeSearchMode: string;
  clearFilter: string;
  clearSearch: string;
  clearSelection: string;
  clearSort: string;
  deselectAllOnAllPages: string;
  deselectAllOnCurrentPage: string;
  clickToCopy: string;
  collapse: string;
  collapseAll: string;
  columnActions: string;
  columns: string;
  copiedToClipboard: string;
  copy: string;
  dropToGroupBy: string;
  edit: string;
  expand: string;
  expandAll: string;
  filterArrIncludes: string;
  filterArrIncludesAll: string;
  filterArrIncludesSome: string;
  filterBetween: string;
  filterBetweenInclusive: string;
  filterByColumn: string;
  filterFrom: string;
  filterTo: string;
  filterContains: string;
  filterEmpty: string;
  filterEndsWith: string;
  filterEquals: string;
  filterEqualsString: string;
  filterFuzzy: string;
  filterGreaterThan: string;
  filterGreaterThanOrEqualTo: string;
  filterInArray: string;
  filterIncludesString: string;
  filterIncludesStringSensitive: string;
  filteringByColumn: string;
  filterInNumberRange: string;
  filterLessThan: string;
  filterLessThanOrEqualTo: string;
  filterMode: string;
  filterNoOptions: string;
  filterNotEmpty: string;
  filterNotEquals: string;
  filterNotContains: string;
  filterOperator: string;
  filterLogic: string;
  filterStartsWith: string;
  filterWeakEquals: string;
  filterCurrentWeek: string;
  filterCurrentMonth: string;
  filterLast7Days: string;
  filterLastWeek: string;
  filterLastMonth: string;
  filterFromToday: string;
  filterToToday: string;
  booleanTrue: string;
  booleanFalse: string;
  goToFirstPage: string;
  goToLastPage: string;
  goToNextPage: string;
  goToPreviousPage: string;
  grab: string;
  groupByColumn: string;
  groupedBy: string;
  hideAll: string;
  hideColumn: string;
  max: string;
  min: string;
  move: string;
  noRecordsToDisplay: string;
  noResultsFound: string;
  moreThan: string;
  of: string;
  or: string;
  pin: string;
  pinToLeft: string;
  pinToRight: string;
  resetColumnSize: string;
  resetOrder: string;
  rowActions: string;
  rowNumber: string;
  rowNumbers: string;
  rowsPerPage: string;
  rowsSelected: string;
  save: string;
  countRows: string;
  countRowsTooltip: string;
  rowCount: string;
  search: string;
  select: string;
  selectAllOnAllPages: string;
  selectAllOnCurrentPage: string;
  selectedCountOfRowCountRowsSelected: string;
  showAll: string;
  showAllColumns: string;
  showHideColumns: string;
  showHideFilters: string;
  showHideSearch: string;
  showAdvancedFilters: string;
  advancedFilters: string;
  filters: string;
  add: string;
  newEntry: string;
  clear: string;
  discardChanges: string;
  saveFilters: string;
  savedFilters: string;
  noSavedFilters: string;
  filterName: string;
  apply: string;
  sortByColumnAsc: string;
  sortByColumnDesc: string;
  sortedByColumnAsc: string;
  sortedByColumnDesc: string;
  thenBy: string;
  toggleDensity: string;
  toggleFullScreen: string;
  toggleSelectAll: string;
  toggleSelectRow: string;
  toggleVisibility: string;
  ungroupByColumn: string;
  unpin: string;
  unpinAll: string;
  // Dimension filter editor — rotation toggle tooltips
  dimensionRotationEnabled: string;
  dimensionRotationDisabled: string;
  // Export toolbar
  exportButton: string;
  exportSelectRowsTooltip: string;
  exportPrintPdf: string;
  exportDownload: string;
  exportGrouped: string;
  // Delete row confirmation dialog message and button labels
  deleteConfirmation: string;
  deleteConfirmYes: string;
  deleteConfirmNo: string;
  deleteConfirmDeleting: string;

  // Allow for any additional keys for custom localization
  [key: string]: string;
}

export interface MRT_Theme {
  baseBackgroundColor: string;
  cellNavigationOutlineColor: string;
  draggingBorderColor: string;
  matchHighlightColor: string;
  menuBackgroundColor: string;
  pinnedRowBackgroundColor: string;
  selectedRowBackgroundColor: string;
}

export interface MRT_RowModel<TData extends MRT_RowData> {
  flatRows: MRT_Row<TData>[];
  rows: MRT_Row<TData>[];
  rowsById: { [key: string]: MRT_Row<TData> };
}

export type MRT_TableInstance<TData extends MRT_RowData> = Omit<
  Table<TData>,
  | 'getAllColumns'
  | 'getAllFlatColumns'
  | 'getAllLeafColumns'
  | 'getBottomRows'
  | 'getCenterLeafColumns'
  | 'getCenterRows'
  | 'getColumn'
  | 'getExpandedRowModel'
  | 'getFlatHeaders'
  | 'getFooterGroups'
  | 'getHeaderGroups'
  | 'getLeafHeaders'
  | 'getLeftLeafColumns'
  | 'getPaginationRowModel'
  | 'getPreFilteredRowModel'
  | 'getPrePaginationRowModel'
  | 'getRightLeafColumns'
  | 'getRowModel'
  | 'getSelectedRowModel'
  | 'getState'
  | 'getTopRows'
  | 'options'
> & {
  getAllColumns: () => MRT_Column<TData>[];
  getAllFlatColumns: () => MRT_Column<TData>[];
  getAllLeafColumns: () => MRT_Column<TData>[];
  getBottomRows: () => MRT_Row<TData>[];
  getCenterLeafColumns: () => MRT_Column<TData>[];
  getCenterRows: () => MRT_Row<TData>[];
  getColumn: (columnId: string) => MRT_Column<TData>;
  getExpandedRowModel: () => MRT_RowModel<TData>;
  getFlatHeaders: () => MRT_Header<TData>[];
  getFooterGroups: () => MRT_HeaderGroup<TData>[];
  getHeaderGroups: () => MRT_HeaderGroup<TData>[];
  getLeafHeaders: () => MRT_Header<TData>[];
  getLeftLeafColumns: () => MRT_Column<TData>[];
  getPaginationRowModel: () => MRT_RowModel<TData>;
  getPreFilteredRowModel: () => MRT_RowModel<TData>;
  getPrePaginationRowModel: () => MRT_RowModel<TData>;
  getRightLeafColumns: () => MRT_Column<TData>[];
  getRowModel: () => MRT_RowModel<TData>;
  getSelectedRowModel: () => MRT_RowModel<TData>;
  getState: () => MRT_TableState<TData>;
  getTopRows: () => MRT_Row<TData>[];
  options: MRT_StatefulTableOptions<TData>;
  refs: {
    actionCellRef: RefObject<HTMLTableCellElement | null>;
    bottomToolbarRef: RefObject<HTMLDivElement | null>;
    editInputRefs: RefObject<Record<string, HTMLInputElement> | null>;
    filterInputRefs: RefObject<Record<string, HTMLInputElement> | null>;
    allSelectableRowIdsRef: RefObject<string[]>;
    lastSelectedRowId: RefObject<null | string>;
    searchInputRef: RefObject<HTMLInputElement | null>;
    tableContainerRef: RefObject<HTMLDivElement | null>;
    tableFooterRef: RefObject<HTMLTableSectionElement | null>;
    tableHeadCellRefs: RefObject<Record<string, HTMLTableCellElement> | null>;
    tableHeadRef: RefObject<HTMLTableSectionElement | null>;
    tablePaperRef: RefObject<HTMLDivElement | null>;
    topToolbarRef: RefObject<HTMLDivElement | null>;
  };
  setActionCell: Dispatch<SetStateAction<MRT_Cell<TData> | null>>;
  setColumnFilterFns: Dispatch<SetStateAction<MRT_ColumnFilterFnsState>>;
  setCreatingRow: Dispatch<SetStateAction<MRT_Row<TData> | null | true>>;
  setDensity: Dispatch<SetStateAction<MRT_DensityState>>;
  setDraggingColumn: Dispatch<SetStateAction<MRT_Column<TData> | null>>;
  setDraggingRow: Dispatch<SetStateAction<MRT_Row<TData> | null>>;
  setEditingCell: Dispatch<SetStateAction<MRT_Cell<TData> | null>>;
  setEditingRow: Dispatch<SetStateAction<MRT_Row<TData> | null>>;
  setFilters: Dispatch<SetStateAction<MRT_FiltersState>>;
  setGlobalFilterFn: Dispatch<SetStateAction<MRT_FilterOption>>;
  setHoveredColumn: Dispatch<SetStateAction<Partial<MRT_Column<TData>> | null>>;
  setHoveredRow: Dispatch<SetStateAction<Partial<MRT_Row<TData>> | null>>;
  setIsFullScreen: Dispatch<SetStateAction<boolean>>;
  setSavedFilters: Dispatch<SetStateAction<MRT_SavedFilters>>;
  setShowAlertBanner: Dispatch<SetStateAction<boolean>>;
  setShowColumnFilters: Dispatch<SetStateAction<boolean>>;
  setShowGlobalFilter: Dispatch<SetStateAction<boolean>>;
  setShowProgressBars: Dispatch<SetStateAction<boolean>>;
  setShowToolbarDropZone: Dispatch<SetStateAction<boolean>>;
  setShowAdvancedFilters: Dispatch<SetStateAction<boolean>>;
  setNewEntryModal: Dispatch<SetStateAction<MRT_NewEntryModalState>>;
  setRowReorderingSelection: Dispatch<
    SetStateAction<MRT_RowReorderingSelectionState>
  >;
};

export type MRT_DefinedTableOptions<TData extends MRT_RowData> = Omit<
  MRT_TableOptions<TData>,
  'icons' | 'localization' | 'mrtTheme'
> & {
  icons: MRT_Icons;
  localization: MRT_Localization;
  mrtTheme: Required<MRT_Theme>;
};

export type MRT_StatefulTableOptions<TData extends MRT_RowData> =
  MRT_DefinedTableOptions<TData> & {
    state: Pick<
      MRT_TableState<TData>,
      | 'columnFilterFns'
      | 'columnOrder'
      | 'columnSizingInfo'
      | 'creatingRow'
      | 'density'
      | 'draggingColumn'
      | 'draggingRow'
      | 'editingCell'
      | 'editingRow'
      | 'filters'
      | 'globalFilterFn'
      | 'grouping'
      | 'hoveredColumn'
      | 'hoveredRow'
      | 'isFullScreen'
      | 'pagination'
      | 'showAlertBanner'
      | 'showAdvancedFilters'
      | 'showColumnFilters'
      | 'showGlobalFilter'
      | 'showToolbarDropZone'
      | 'newEntryModal'
      | 'rowReorderingSelection'
    >;
  };

export interface MRT_TableState<TData extends MRT_RowData> extends TableState {
  actionCell?: MRT_Cell<TData> | null;
  columnFilterFns: MRT_ColumnFilterFnsState;
  creatingRow: MRT_Row<TData> | null;
  density: MRT_DensityState;
  draggingColumn: MRT_Column<TData> | null;
  draggingRow: MRT_Row<TData> | null;
  editingCell: MRT_Cell<TData> | null;
  editingRow: MRT_Row<TData> | null;
  filters: MRT_FiltersState;
  globalFilterFn: MRT_FilterOption;
  hoveredColumn: Partial<MRT_Column<TData>> | null;
  hoveredRow: Partial<MRT_Row<TData>> | null;
  isFullScreen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  savedFilters: MRT_SavedFilters;
  showAlertBanner: boolean;
  showColumnFilters: boolean;
  showGlobalFilter: boolean;
  showAdvancedFilters: boolean;
  showLoadingOverlay: boolean;
  showProgressBars: boolean;
  showSkeletons: boolean;
  showToolbarDropZone: boolean;
  activeExports?: MRT_ActiveExportsState;
  newEntryModal: MRT_NewEntryModalState;
  rowReorderingSelection: MRT_RowReorderingSelectionState;
}

interface MRT_ColumnDefBase<TData extends MRT_RowData, TValue = unknown>
  extends Omit<
    ColumnDef<TData, TValue>,
    | 'accessorKey'
    | 'aggregatedCell'
    | 'aggregationFn'
    | 'cell'
    | 'columns'
    | 'filterFn'
    | 'footer'
    | 'header'
    | 'id'
    | 'sortingFn'
  > {
  /**
   * Either an `accessorKey` or a combination of an `accessorFn` and `id` are required for a data column definition.
   * Specify a function here to point to the correct property in the data object.
   *
   * @example accessorFn: (row) => row.username
   */
  accessorFn?: (originalRow: TData) => TValue;
  /**
   * Either an `accessorKey` or a combination of an `accessorFn` and `id` are required for a data column definition.
   * Specify which key in the row this column should use to access the correct data.
   * Also supports Deep Key Dot Notation.
   *
   * @example accessorKey: 'username' //simple
   * @example accessorKey: 'name.firstName' //deep key dot notation
   */
  accessorKey?: DeepKeys<TData> | (string & {});
  AggregatedCell?: (props: {
    cell: MRT_Cell<TData, TValue>;
    column: MRT_Column<TData, TValue>;
    row: MRT_Row<TData>;
    table: MRT_TableInstance<TData>;
    staticColumnIndex?: number;
    staticRowIndex?: number;
  }) => ReactNode;
  aggregationFn?: Array<MRT_AggregationFn<TData>> | MRT_AggregationFn<TData>;
  Cell?: (props: {
    cell: MRT_Cell<TData, TValue>;
    column: MRT_Column<TData, TValue>;
    renderedCellValue: ReactNode;
    row: MRT_Row<TData>;
    rowRef?: RefObject<HTMLTableRowElement | null>;
    staticColumnIndex?: number;
    staticRowIndex?: number;
    table: MRT_TableInstance<TData>;
  }) => ReactNode;
  /**
   * Specify what type of column this is. Either `data`, `display`, or `group`. Defaults to `data`.
   * Leave this blank if you are just creating a normal data column.
   *
   * @default 'data'
   *
   * @example columnDefType: 'display'
   */
  columnDefType?: 'data' | 'display' | 'group';
  columnFilterModeOptions?: Array<
    LiteralUnion<string & MRT_FilterOption>
  > | null;
  columns?: MRT_ColumnDef<TData, TValue>[];
  Edit?: (props: {
    cell: MRT_Cell<TData, TValue>;
    column: MRT_Column<TData, TValue>;
    row: MRT_Row<TData>;
    table: MRT_TableInstance<TData>;
  }) => ReactNode;
  editSelectOptions?:
    | ((props: {
        cell: MRT_Cell<TData, TValue>;
        column: MRT_Column<TData>;
        row: MRT_Row<TData>;
        table: MRT_TableInstance<TData>;
      }) => DropdownOption[])
    | DropdownOption[];
  editVariant?: 'select' | 'text';
  enableClickToCopy?:
    | 'context-menu'
    | ((cell: MRT_Cell<TData>) => 'context-menu' | boolean)
    | boolean;
  enableColumnActions?: boolean;
  enableColumnDragging?: boolean;
  enableColumnFilterModes?: boolean;
  enableColumnOrdering?: boolean;
  enableEditing?: ((row: MRT_Row<TData>) => boolean) | boolean;
  enableFilterMatchHighlighting?: boolean;
  Filter?: (props: {
    column: MRT_Column<TData, TValue>;
    header: MRT_Header<TData>;
    rangeFilterIndex?: number;
    table: MRT_TableInstance<TData>;
  }) => ReactNode;
  filterFn?: MRT_FilterFn<TData>;
  filterSelectOptions?: DropdownOption[];
  filterVariant?:
    | 'autocomplete'
    | 'checkbox'
    | 'date'
    | 'date-range'
    | 'datetime'
    | 'datetime-range'
    | 'multi-select'
    | 'range'
    | 'range-slider'
    | 'select'
    | 'text'
    | 'time'
    | 'time-range';
  /**
   * footer must be a string. If you want custom JSX to render the footer, you can also specify a `Footer` option. (Capital F)
   */
  footer?: string;
  Footer?:
    | ((props: {
        column: MRT_Column<TData, TValue>;
        footer: MRT_Header<TData>;
        table: MRT_TableInstance<TData>;
      }) => ReactNode)
    | ReactNode;
  GroupedCell?: (props: {
    cell: MRT_Cell<TData, TValue>;
    column: MRT_Column<TData, TValue>;
    row: MRT_Row<TData>;
    table: MRT_TableInstance<TData>;
    staticColumnIndex?: number;
    staticRowIndex?: number;
  }) => ReactNode;
  /**
   * If `layoutMode` is `'grid'` or `'grid-no-grow'`, you can specify the flex grow value for individual columns to still grow and take up remaining space, or set to `false`/0 to not grow.
   */
  grow?: boolean | number;
  /**
   * header must be a string. If you want custom JSX to render the header, you can also specify a `Header` option. (Capital H)
   */
  header: string;
  Header?:
    | ((props: {
        column: MRT_Column<TData, TValue>;
        header: MRT_Header<TData>;
        table: MRT_TableInstance<TData>;
      }) => ReactNode)
    | ReactNode;
  /**
   * Either an `accessorKey` or a combination of an `accessorFn` and `id` are required for a data column definition.
   *
   * If you have also specified an `accessorFn`, MRT still needs to have a valid `id` to be able to identify the column uniquely.
   *
   * `id` defaults to the `accessorKey` or `header` if not specified.
   *
   * @default gets set to the same value as `accessorKey` by default
   */
  id?: LiteralUnion<string & keyof TData>;
  muiColumnActionsButtonProps?:
    | ((props: {
        column: MRT_Column<TData>;
        table: MRT_TableInstance<TData>;
      }) => IconButtonProps)
    | IconButtonProps;
  muiColumnDragHandleProps?:
    | ((props: {
        column: MRT_Column<TData>;
        table: MRT_TableInstance<TData>;
      }) => IconButtonProps)
    | IconButtonProps;
  muiCopyButtonProps?:
    | ((props: {
        cell: MRT_Cell<TData, TValue>;
        column: MRT_Column<TData>;
        row: MRT_Row<TData>;
        table: MRT_TableInstance<TData>;
      }) => ButtonProps)
    | ButtonProps;
  muiEditTextFieldProps?:
    | ((props: {
        cell: MRT_Cell<TData, TValue>;
        column: MRT_Column<TData>;
        row: MRT_Row<TData>;
        table: MRT_TableInstance<TData>;
      }) => TextFieldProps)
    | TextFieldProps;
  // MUI Autocomplete has four generic parameters (Value, Multiple, DisableClearable, FreeSolo).
  // TValue is used for the value type so it aligns with the column's accessor type.
  // Multiple, DisableClearable and FreeSolo are widened to boolean | undefined to accept any config.
  muiFilterAutocompleteProps?:
    | ((props: {
        column: MRT_Column<TData>;
        table: MRT_TableInstance<TData>;
      }) => AutocompleteProps<
        TValue,
        boolean | undefined,
        boolean | undefined,
        boolean | undefined
      >)
    | AutocompleteProps<
        TValue,
        boolean | undefined,
        boolean | undefined,
        boolean | undefined
      >;
  muiFilterCheckboxProps?:
    | ((props: {
        column: MRT_Column<TData>;
        table: MRT_TableInstance<TData>;
      }) => CheckboxProps)
    | CheckboxProps;
  muiFilterDatePickerProps?:
    | ((props: {
        column: MRT_Column<TData>;
        rangeFilterIndex?: number;
        table: MRT_TableInstance<TData>;
      }) => DatePickerProps<never>)
    | DatePickerProps<never>;
  muiFilterDateTimePickerProps?:
    | ((props: {
        column: MRT_Column<TData>;
        rangeFilterIndex?: number;
        table: MRT_TableInstance<TData>;
      }) => DateTimePickerProps<never>)
    | DateTimePickerProps<never>;
  muiFilterSliderProps?:
    | ((props: {
        column: MRT_Column<TData>;
        table: MRT_TableInstance<TData>;
      }) => SliderProps)
    | SliderProps;
  muiFilterTextFieldProps?:
    | ((props: {
        column: MRT_Column<TData>;
        rangeFilterIndex?: number;
        table: MRT_TableInstance<TData>;
      }) => TextFieldProps)
    | TextFieldProps;
  muiFilterTimePickerProps?:
    | ((props: {
        column: MRT_Column<TData>;
        rangeFilterIndex?: number;
        table: MRT_TableInstance<TData>;
      }) => TimePickerProps<never>)
    | TimePickerProps<never>;
  muiTableBodyCellProps?:
    | ((props: {
        cell: MRT_Cell<TData, TValue>;
        column: MRT_Column<TData>;
        row: MRT_Row<TData>;
        table: MRT_TableInstance<TData>;
      }) => TableCellProps)
    | TableCellProps;
  muiTableFooterCellProps?:
    | ((props: {
        column: MRT_Column<TData>;
        table: MRT_TableInstance<TData>;
      }) => TableCellProps)
    | TableCellProps;
  muiTableHeadCellProps?:
    | ((props: {
        column: MRT_Column<TData>;
        table: MRT_TableInstance<TData>;
      }) => TableCellProps)
    | TableCellProps;
  // Form field configuration — controls how this column appears and behaves in the create/edit form.
  // Use a config object for static settings, or a render function for full custom control.
  formField?:
    | MRT_FormFieldConfig<TData, TValue>
    | ((props: MRT_FormFieldRenderProps<TData, TValue>) => ReactNode);
  PlaceholderCell?: (props: {
    cell: MRT_Cell<TData, TValue>;
    column: MRT_Column<TData, TValue>;
    row: MRT_Row<TData>;
    table: MRT_TableInstance<TData>;
  }) => ReactNode;
  renderCellActionMenuItems?: (props: {
    cell: MRT_Cell<TData>;
    closeMenu: () => void;
    column: MRT_Column<TData>;
    internalMenuItems: ReactNode[];
    row: MRT_Row<TData>;
    staticColumnIndex?: number;
    staticRowIndex?: number;
    table: MRT_TableInstance<TData>;
  }) => ReactNode[];
  renderColumnActionsMenuItems?: (props: {
    closeMenu: () => void;
    column: MRT_Column<TData>;
    internalColumnMenuItems: ReactNode[];
    table: MRT_TableInstance<TData>;
  }) => ReactNode[];
  renderColumnFilterModeMenuItems?: (props: {
    column: MRT_Column<TData>;
    internalFilterOptions: MRT_InternalFilterOption[];
    onSelectFilterMode: (filterMode: MRT_FilterOption) => void;
    table: MRT_TableInstance<TData>;
  }) => ReactNode[];
  sortingFn?: MRT_SortingFn<TData>;
  visibleInShowHideMenu?: boolean;
}

type MRT_IconTypeColumnClickArgs<TData extends MRT_RowData> = {
  table: MRT_TableInstance<TData>;
  row: MRT_Row<TData>;
  value: unknown;
  anchorEl: HTMLElement | null;
  columnId?: string;
};

// Shape of one entry in the iconsList map — Iconify icon name + default colour
export type MRT_IconsListEntry = {
  icon: string;
  defaultColor: string;
};

export type MRT_IconColumnDef<
  TData extends MRT_RowData,
  TValue = unknown,
> = MRT_ColumnDefBase<TData, TValue> & {
  onClickIconTypeColumn?: (args: MRT_IconTypeColumnClickArgs<TData>) => void;
  iconsList?: Record<string, MRT_IconsListEntry>;
  type: 'icon';
};

export type MRT_NonIconColumnDef<
  TData extends MRT_RowData,
  TValue = unknown,
> = MRT_ColumnDefBase<TData, TValue> & {
  onClickIconTypeColumn?: never;
  iconsList?: never;
  type: LiteralUnion<Exclude<ColumnType, 'icon'>>;
};

export type MRT_ColumnDef<TData extends MRT_RowData, TValue = unknown> =
  | MRT_IconColumnDef<TData, TValue>
  | MRT_NonIconColumnDef<TData, TValue>;

export type MRT_DisplayColumnDef<
  TData extends MRT_RowData,
  TValue = unknown,
> = DistributiveOmit<
  MRT_ColumnDef<TData, TValue>,
  'accessorFn' | 'accessorKey'
>;

export type MRT_GroupColumnDef<TData extends MRT_RowData> =
  MRT_DisplayColumnDef<TData, unknown> & {
    columns: MRT_ColumnDef<TData>[];
  };

export type MRT_DefinedColumnDef<
  TData extends MRT_RowData,
  TValue = unknown,
> = DistributiveOmit<
  MRT_ColumnDef<TData, TValue>,
  'defaultDisplayColumn' | 'id'
> & {
  _filterFn: MRT_FilterOption;
  defaultDisplayColumn: Partial<MRT_ColumnDef<TData, TValue>>;
  id: string;
};

export type MRT_Column<TData extends MRT_RowData, TValue = unknown> = Omit<
  Column<TData, TValue>,
  'columnDef' | 'columns' | 'filterFn' | 'footer' | 'header'
> & {
  columnDef: MRT_DefinedColumnDef<TData, TValue>;
  columns?: MRT_Column<TData, TValue>[];
  filterFn?: MRT_FilterFn<TData>;
  footer: string;
  header: string;
};

export type MRT_Header<TData extends MRT_RowData> = Omit<
  Header<TData, unknown>,
  'column'
> & {
  column: MRT_Column<TData>;
};

export type MRT_HeaderGroup<TData extends MRT_RowData> = Omit<
  HeaderGroup<TData>,
  'headers'
> & {
  headers: MRT_Header<TData>[];
};

export type MRT_Row<TData extends MRT_RowData> = Omit<
  Row<TData>,
  | '_valuesCache'
  | 'getAllCells'
  | 'getParentRow'
  | 'getParentRows'
  | 'getRow'
  | 'getVisibleCells'
  | 'subRows'
> & {
  _valuesCache: Record<LiteralUnion<string & DeepKeys<TData>>, unknown>;
  getAllCells: () => MRT_Cell<TData>[];
  getParentRow: () => MRT_Row<TData> | null;
  getParentRows: () => MRT_Row<TData>[];
  getRow: () => MRT_Row<TData>;
  getVisibleCells: () => MRT_Cell<TData>[];
  subRows?: MRT_Row<TData>[];
};

export type MRT_Cell<TData extends MRT_RowData, TValue = unknown> = Omit<
  Cell<TData, TValue>,
  'column' | 'row'
> & {
  column: MRT_Column<TData, TValue>;
  row: MRT_Row<TData>;
};

export type MRT_AggregationOption = string & keyof typeof MRT_AggregationFns;

export type MRT_AggregationFn<TData extends MRT_RowData> =
  | AggregationFn<TData>
  | MRT_AggregationOption;

export type MRT_SortingOption = LiteralUnion<
  string & keyof typeof MRT_SortingFns
>;

export type MRT_SortingFn<TData extends MRT_RowData> =
  | MRT_SortingOption
  | SortingFn<TData>;

export type MRT_FilterOption = LiteralUnion<
  string & keyof typeof MRT_FilterFns
>;

export type MRT_FilterFn<TData extends MRT_RowData> =
  | FilterFn<TData>
  | MRT_FilterOption;

export type MRT_InternalFilterOption = {
  divider: boolean;
  label: string;
  option: string;
  symbol: string;
};

export type MRT_RowReorderingSelectionState = Record<string, boolean>;

export type MRT_TreeRowReorderEvent<TData extends MRT_RowData> = {
  selectedRowIds: string[];
  selectedRows: MRT_Row<TData>[];
  table: MRT_TableInstance<TData>;
  targetRow: MRT_Row<TData> | null;
};

export type MRT_DisplayColumnIds =
  | 'mrt-row-actions'
  | 'mrt-row-drag'
  | 'mrt-row-expand'
  | 'mrt-row-numbers'
  | 'mrt-row-pin'
  | '__check__'
  | 'mrt-row-spacer';

/**
 * `columns` and `data` props are the only required props, but there are over 170 other optional props.
 *
 * See more info on creating columns and data on the official docs site:
 * @link https://www.material-react-table.com/docs/getting-started/usage
 *
 * See the full props list on the official docs site:
 * @link https://www.material-react-table.com/docs/api/props
 */
export interface MRT_TableOptions<TData extends MRT_RowData>
  extends Omit<
    Partial<TableOptions<TData>>,
    | 'columns'
    | 'data'
    | 'defaultColumn'
    | 'enableRowSelection'
    | 'expandRowsFn'
    | 'getRowId'
    | 'globalFilterFn'
    | 'initialState'
    | 'onStateChange'
    | 'state'
  > {
  columnFilterDisplayMode?: 'custom' | 'popover' | 'subheader';
  columnFilterModeOptions?: Array<
    LiteralUnion<string & MRT_FilterOption>
  > | null;
  /**
   * The columns to display in the table. `accessorKey`s or `accessorFn`s must match keys in the `data` table option.
   *
   * See more info on creating columns on the official docs site:
   * @link https://www.material-react-table.com/docs/guides/data-columns
   * @link https://www.material-react-table.com/docs/guides/display-columns
   *
   * See all Columns Options on the official docs site:
   * @link https://www.material-react-table.com/docs/api/column-options
   */
  columns: MRT_ColumnDef<TData>[];
  columnVirtualizerInstanceRef?: RefObject<MRT_ColumnVirtualizer | null>;
  columnVirtualizerOptions?:
    | ((props: {
        table: MRT_TableInstance<TData>;
      }) => Partial<VirtualizerOptions<HTMLDivElement, HTMLTableCellElement>>)
    | Partial<VirtualizerOptions<HTMLDivElement, HTMLTableCellElement>>;
  createDisplayMode?: 'custom' | 'modal' | 'row';
  /**
   * Pass your data as an array of objects. Objects can theoretically be any shape, but it's best to keep them consistent.
   *
   * See the usage guide for more info on creating columns and data:
   * @link https://www.material-react-table.com/docs/getting-started/usage
   */
  data: TData[];
  /**
   * Instead of specifying a bunch of the same options for each column, you can just change an option in the `defaultColumn` table option to change a default option for all columns.
   */
  defaultColumn?: Partial<MRT_ColumnDef<TData>>;
  /**
   * Change the default options for display columns.
   */
  defaultDisplayColumn?: Partial<MRT_DisplayColumnDef<TData>>;
  displayColumnDefOptions?: Partial<{
    [key in MRT_DisplayColumnIds]: Partial<MRT_DisplayColumnDef<TData>>;
  }>;
  editDisplayMode?: 'cell' | 'custom' | 'modal' | 'row' | 'table';
  enableBatchRowSelection?: boolean;
  enableBottomToolbar?: boolean;
  enableCellActions?: ((cell: MRT_Cell<TData>) => boolean) | boolean;
  enableClickToCopy?:
    | 'context-menu'
    | ((cell: MRT_Cell<TData>) => 'context-menu' | boolean)
    | boolean;
  enableColumnActions?: boolean;
  enableColumnDragging?: boolean;
  enableColumnFilterModes?: boolean;
  enableColumnOrdering?: boolean;
  enableColumnVirtualization?: boolean;
  enableDensityToggle?: boolean;
  enableNewEntryButton?: boolean;
  enableEditing?: ((row: MRT_Row<TData>) => boolean) | boolean;
  enableExpandAll?: boolean;
  maxDepth?: number;
  enableRowReordering?: boolean;
  enableFacetedValues?: boolean;
  enableAdvancedFilters?: boolean;
  enableFilterMatchHighlighting?: boolean;
  enableFullScreenToggle?: boolean;
  enableGlobalFilterModes?: boolean;
  enableGlobalFilterRankedResults?: boolean;
  enableKeyboardShortcuts?: boolean;
  enablePagination?: boolean;
  enableRowActions?: boolean;
  enableRowDragging?: boolean;
  enableRowNumbers?: boolean;
  enableRowOrdering?: boolean;
  enableRowSelection?: ((row: MRT_Row<TData>) => boolean) | boolean;
  enableRowVirtualization?: boolean;
  /**
   * Async function that returns all selectable row IDs across all pages.
   * This is necessary for server-side pagination when using the "Select all rows on all pages" feature, as the table needs to * know which rows are selectable in order to manage selection state correctly.
   * Required for "Select all rows on all pages" server-side feature.
   * Only called when the user triggers a cross-page select-all action.
   */
  getAllSelectableRowIds?: (props: {
    table: MRT_TableInstance<TData>;
  }) => Promise<string[]>;
  /**
   * Async function that returns the exact total row count for the current
   * filter/grouping state. When provided, a "Count Rows" button is rendered
   * in the bottom toolbar next to pagination.
   */
  getTotalRows?: (props: {
    table: MRT_TableInstance<TData>;
  }) => Promise<number>;
  /**
   * Available export definitions. When provided together with `loadExport`,
   * an export button is rendered in the toolbar.
   */
  availableExports?: Record<string, MRT_ExportDefinition>;
  /**
   * Async function called when the user triggers an export action.
   * The library stays backend-agnostic — implement your HTTP call here.
   */
  loadExport?: (params: MRT_ExportParams) => Promise<MRT_ExportFileResponse[]>;
  /**
   * Handler called when the active export state changes (selected exports,
   * format, grouped flag). Used to persist export state via useServerTableState.
   */
  onActiveExportsChange?: Dispatch<
    SetStateAction<MRT_ActiveExportsState | undefined>
  >;
  enableSelectAll?: boolean;
  enableStickyFooter?: boolean;
  enableStickyHeader?: boolean;
  enableTableFooter?: boolean;
  enableTableHead?: boolean;
  enableToolbarInternalActions?: boolean;
  enableTopToolbar?: boolean;
  expandRowsFn?: (dataRow: TData) => TData[];
  getRowId?: (
    originalRow: TData,
    index: number,
    parentRow: MRT_Row<TData>,
  ) => string;
  globalFilterFn?: MRT_FilterOption;
  globalFilterModeOptions?: MRT_FilterOption[] | null;
  icons?: Partial<MRT_Icons>;
  id?: string;
  initialState?: Partial<MRT_TableState<TData>>;
  /**
   * Changes which kind of CSS layout is used to render the table. `semantic` uses default semantic HTML elements, while `grid` adds CSS grid and flexbox styles
   */
  layoutMode?: 'grid' | 'grid-no-grow' | 'semantic';
  /**
   * Pass in either a locale imported from `material-react-table/locales/*` or a custom locale object.
   *
   * See the localization (i18n) guide for more info:
   * @link https://www.material-react-table.com/docs/guides/localization
   */
  localization?: Partial<MRT_Localization>;
  /**
   * Memoize cells, rows, or the entire table body to potentially improve render performance.
   *
   * @warning This will break some dynamic rendering features. See the memoization guide for more info:
   * @link https://www.material-react-table.com/docs/guides/memoize-components
   */
  memoMode?: 'cells' | 'rows' | 'table-body';
  mrtTheme?: ((theme: Theme) => Partial<MRT_Theme>) | Partial<MRT_Theme>;
  muiBottomToolbarProps?:
    | ((props: { table: MRT_TableInstance<TData> }) => BoxProps)
    | BoxProps;
  muiCircularProgressProps?:
    | ((props: {
        table: MRT_TableInstance<TData>;
      }) => CircularProgressProps & { Component?: ReactNode })
    | (CircularProgressProps & { Component?: ReactNode });
  muiColumnActionsButtonProps?:
    | ((props: {
        column: MRT_Column<TData>;
        table: MRT_TableInstance<TData>;
      }) => IconButtonProps)
    | IconButtonProps;
  muiColumnDragHandleProps?:
    | ((props: {
        column: MRT_Column<TData>;
        table: MRT_TableInstance<TData>;
      }) => IconButtonProps)
    | IconButtonProps;
  muiCopyButtonProps?:
    | ((props: {
        cell: MRT_Cell<TData>;
        column: MRT_Column<TData>;
        row: MRT_Row<TData>;
        table: MRT_TableInstance<TData>;
      }) => ButtonProps)
    | ButtonProps;
  muiCreateRowModalProps?:
    | ((props: {
        row: MRT_Row<TData>;
        table: MRT_TableInstance<TData>;
      }) => DialogProps)
    | DialogProps;
  muiDetailPanelProps?:
    | ((props: {
        row: MRT_Row<TData>;
        table: MRT_TableInstance<TData>;
      }) => TableCellProps)
    | TableCellProps;
  muiEditRowDialogProps?:
    | ((props: {
        row: MRT_Row<TData>;
        table: MRT_TableInstance<TData>;
      }) => DialogProps)
    | DialogProps;
  muiEditTextFieldProps?:
    | ((props: {
        cell: MRT_Cell<TData>;
        column: MRT_Column<TData>;
        row: MRT_Row<TData>;
        table: MRT_TableInstance<TData>;
      }) => TextFieldProps)
    | TextFieldProps;
  muiExpandAllButtonProps?:
    | ((props: { table: MRT_TableInstance<TData> }) => IconButtonProps)
    | IconButtonProps;
  muiExpandButtonProps?:
    | ((props: {
        row: MRT_Row<TData>;
        staticRowIndex?: number;
        table: MRT_TableInstance<TData>;
      }) => IconButtonProps)
    | IconButtonProps;
  // MUI Autocomplete has four generic parameters (Value, Multiple, DisableClearable, FreeSolo).
  // unknown is used for the value type at the table-options level where column TValue is not available.
  // Multiple, DisableClearable and FreeSolo are widened to boolean | undefined to accept any config.
  muiFilterAutocompleteProps?:
    | ((props: {
        column: MRT_Column<TData>;
        table: MRT_TableInstance<TData>;
      }) => AutocompleteProps<
        unknown,
        boolean | undefined,
        boolean | undefined,
        boolean | undefined
      >)
    | AutocompleteProps<
        unknown,
        boolean | undefined,
        boolean | undefined,
        boolean | undefined
      >;
  muiFilterCheckboxProps?:
    | ((props: {
        column: MRT_Column<TData>;
        table: MRT_TableInstance<TData>;
      }) => CheckboxProps)
    | CheckboxProps;
  muiFilterDatePickerProps?:
    | ((props: {
        column: MRT_Column<TData>;
        rangeFilterIndex?: number;
        table: MRT_TableInstance<TData>;
      }) => DatePickerProps<never>)
    | DatePickerProps<never>;
  muiFilterDateTimePickerProps?:
    | ((props: {
        column: MRT_Column<TData>;
        rangeFilterIndex?: number;
        table: MRT_TableInstance<TData>;
      }) => DateTimePickerProps<never>)
    | DateTimePickerProps<never>;
  muiFilterSliderProps?:
    | ((props: {
        column: MRT_Column<TData>;
        table: MRT_TableInstance<TData>;
      }) => SliderProps)
    | SliderProps;
  muiFilterTextFieldProps?:
    | ((props: {
        column: MRT_Column<TData>;
        rangeFilterIndex?: number;
        table: MRT_TableInstance<TData>;
      }) => TextFieldProps)
    | TextFieldProps;
  muiFilterTimePickerProps?:
    | ((props: {
        column: MRT_Column<TData>;
        rangeFilterIndex?: number;
        table: MRT_TableInstance<TData>;
      }) => TimePickerProps<never>)
    | TimePickerProps<never>;
  muiLinearProgressProps?:
    | ((props: {
        isTopToolbar: boolean;
        table: MRT_TableInstance<TData>;
      }) => LinearProgressProps)
    | LinearProgressProps;
  muiPaginationProps?:
    | ((props: { table: MRT_TableInstance<TData> }) => Partial<
        PaginationProps & {
          SelectProps?: Partial<SelectProps>;
          disabled?: boolean;
          rowsPerPageOptions?: { label: string; value: number }[] | number[];
          showRowsPerPage?: boolean;
        }
      >)
    | Partial<
        PaginationProps & {
          SelectProps?: Partial<SelectProps>;
          disabled?: boolean;
          rowsPerPageOptions?: { label: string; value: number }[] | number[];
          showRowsPerPage?: boolean;
        }
      >;
  muiRowDragHandleProps?:
    | ((props: {
        row: MRT_Row<TData>;
        table: MRT_TableInstance<TData>;
      }) => IconButtonProps)
    | IconButtonProps;
  muiSearchTextFieldProps?:
    | ((props: { table: MRT_TableInstance<TData> }) => TextFieldProps)
    | TextFieldProps;
  muiSelectAllCheckboxProps?:
    | ((props: { table: MRT_TableInstance<TData> }) => CheckboxProps)
    | CheckboxProps;
  muiSelectCheckboxProps?:
    | ((props: {
        row: MRT_Row<TData>;
        staticRowIndex?: number;
        table: MRT_TableInstance<TData>;
      }) => CheckboxProps | RadioProps)
    | (CheckboxProps | RadioProps);
  muiSkeletonProps?:
    | ((props: {
        cell: MRT_Cell<TData>;
        column: MRT_Column<TData>;
        row: MRT_Row<TData>;
        table: MRT_TableInstance<TData>;
      }) => SkeletonProps)
    | SkeletonProps;
  muiTableBodyCellProps?:
    | ((props: {
        cell: MRT_Cell<TData>;
        column: MRT_Column<TData>;
        row: MRT_Row<TData>;
        table: MRT_TableInstance<TData>;
      }) => TableCellProps)
    | TableCellProps;
  muiTableBodyProps?:
    | ((props: { table: MRT_TableInstance<TData> }) => TableBodyProps)
    | TableBodyProps;
  muiTableBodyRowProps?:
    | ((props: {
        isDetailPanel?: boolean;
        row: MRT_Row<TData>;
        staticRowIndex: number;
        table: MRT_TableInstance<TData>;
      }) => TableRowProps)
    | TableRowProps;
  muiTableContainerProps?:
    | ((props: { table: MRT_TableInstance<TData> }) => TableContainerProps)
    | TableContainerProps;
  muiTableFooterCellProps?:
    | ((props: {
        column: MRT_Column<TData>;
        table: MRT_TableInstance<TData>;
      }) => TableCellProps)
    | TableCellProps;
  muiTableFooterProps?:
    | ((props: { table: MRT_TableInstance<TData> }) => TableFooterProps)
    | TableFooterProps;
  muiTableFooterRowProps?:
    | ((props: {
        footerGroup: MRT_HeaderGroup<TData>;
        table: MRT_TableInstance<TData>;
      }) => TableRowProps)
    | TableRowProps;
  muiTableHeadCellProps?:
    | ((props: {
        column: MRT_Column<TData>;
        table: MRT_TableInstance<TData>;
      }) => TableCellProps)
    | TableCellProps;
  muiTableHeadProps?:
    | ((props: { table: MRT_TableInstance<TData> }) => TableHeadProps)
    | TableHeadProps;
  muiTableHeadRowProps?:
    | ((props: {
        headerGroup: MRT_HeaderGroup<TData>;
        table: MRT_TableInstance<TData>;
      }) => TableRowProps)
    | TableRowProps;
  muiTablePaperProps?:
    | ((props: { table: MRT_TableInstance<TData> }) => PaperProps)
    | PaperProps;
  muiTableProps?:
    | ((props: { table: MRT_TableInstance<TData> }) => TableProps)
    | TableProps;
  muiToolbarAlertBannerChipProps?:
    | ((props: { table: MRT_TableInstance<TData> }) => ChipProps)
    | ChipProps;
  muiToolbarAlertBannerProps?:
    | ((props: { table: MRT_TableInstance<TData> }) => AlertProps)
    | AlertProps;
  muiTopToolbarProps?:
    | ((props: { table: MRT_TableInstance<TData> }) => BoxProps)
    | BoxProps;
  // Styling overrides for MRT_NewEntryModal.
  muiNewEntryModalProps?: MRT_NewEntryModalOverrides;
  onActionCellChange?: OnChangeFn<MRT_Cell<TData> | null>;
  onColumnFilterFnsChange?: OnChangeFn<{ [key: string]: MRT_FilterOption }>;
  onCreatingRowCancel?: (props: {
    row: MRT_Row<TData>;
    table: MRT_TableInstance<TData>;
  }) => void;
  onCreatingRowChange?: OnChangeFn<MRT_Row<TData> | null>;
  onCreatingRowSave?: (props: {
    exitCreatingMode: () => void;
    row: MRT_Row<TData>;
    table: MRT_TableInstance<TData>;
    values: Record<LiteralUnion<string & DeepKeys<TData>>, unknown>;
  }) => Promise<void> | void;
  onDensityChange?: OnChangeFn<MRT_DensityState>;
  onDraggingColumnChange?: OnChangeFn<MRT_Column<TData> | null>;
  onDraggingRowChange?: OnChangeFn<MRT_Row<TData> | null>;
  onEditingCellChange?: OnChangeFn<MRT_Cell<TData> | null>;
  onEditingRowCancel?: (props: {
    row: MRT_Row<TData>;
    table: MRT_TableInstance<TData>;
  }) => void;
  onEditingRowChange?: OnChangeFn<MRT_Row<TData> | null>;
  onEditingRowSave?: (props: {
    exitEditingMode: () => void;
    row: MRT_Row<TData>;
    table: MRT_TableInstance<TData>;
    values: Record<LiteralUnion<string & DeepKeys<TData>>, unknown>;
  }) => Promise<void> | void;
  onFiltersChange?: OnChangeFn<MRT_FiltersState>;
  onGlobalFilterFnChange?: OnChangeFn<MRT_FilterOption>;
  // Called when the user saves a filter preset. Return resolved promise on success,
  // rejected promise on failure. The drawer input stays open on rejection.
  onSaveFilters?: (savedFilter: MRT_SavedFilter) => Promise<void>;
  // Called when the user deletes a saved filter preset.
  onDeleteSavedFilter?: (filterName: string) => Promise<void>;
  // Preset saved filters to initialise the table with (e.g. loaded from the server).
  initialSavedFilters?: MRT_SavedFilters;
  onHoveredColumnChange?: OnChangeFn<Partial<MRT_Column<TData>> | null>;
  onHoveredRowChange?: OnChangeFn<Partial<MRT_Row<TData>> | null>;
  onIsFullScreenChange?: OnChangeFn<boolean>;
  onShowAlertBannerChange?: OnChangeFn<boolean>;
  onShowAdvancedFiltersChange?: OnChangeFn<boolean>;
  onShowColumnFiltersChange?: OnChangeFn<boolean>;
  onShowGlobalFilterChange?: OnChangeFn<boolean>;
  onShowToolbarDropZoneChange?: OnChangeFn<boolean>;
  onRowReorderingSelectionChange?: OnChangeFn<MRT_RowReorderingSelectionState>;
  onTreeRowReorder?: (event: MRT_TreeRowReorderEvent<TData>) => void;
  paginationDisplayMode?: 'custom' | 'default' | 'pages';
  positionActionsColumn?: 'first' | 'last';
  positionCreatingRow?: 'bottom' | 'top' | number;
  positionExpandColumn?: 'first' | 'last';
  positionGlobalFilter?: 'left' | 'none' | 'right';
  positionPagination?: 'both' | 'bottom' | 'none' | 'top';
  positionToolbarAlertBanner?: 'bottom' | 'head-overlay' | 'none' | 'top';
  positionToolbarDropZone?: 'both' | 'bottom' | 'none' | 'top';
  renderBottomToolbar?:
    | ((props: { table: MRT_TableInstance<TData> }) => ReactNode)
    | ReactNode;
  renderBottomToolbarCustomActions?: (props: {
    table: MRT_TableInstance<TData>;
  }) => ReactNode;
  renderCaption?:
    | ((props: { table: MRT_TableInstance<TData> }) => ReactNode)
    | ReactNode;
  renderCellActionMenuItems?: (props: {
    cell: MRT_Cell<TData>;
    closeMenu: () => void;
    column: MRT_Column<TData>;
    internalMenuItems: ReactNode[];
    row: MRT_Row<TData>;
    staticColumnIndex?: number;
    staticRowIndex?: number;
    table: MRT_TableInstance<TData>;
  }) => ReactNode[];
  renderColumnActionsMenuItems?: (props: {
    closeMenu: () => void;
    column: MRT_Column<TData>;
    internalColumnMenuItems: ReactNode[];
    table: MRT_TableInstance<TData>;
  }) => ReactNode[];
  renderColumnFilterModeMenuItems?: (props: {
    column: MRT_Column<TData>;
    internalFilterOptions: MRT_InternalFilterOption[];
    onSelectFilterMode: (filterMode: MRT_FilterOption) => void;
    table: MRT_TableInstance<TData>;
  }) => ReactNode[];
  renderCreateRowDialogContent?: (props: {
    internalEditComponents: ReactNode[];
    row: MRT_Row<TData>;
    table: MRT_TableInstance<TData>;
  }) => ReactNode;
  renderDetailPanel?: (props: {
    row: MRT_Row<TData>;
    table: MRT_TableInstance<TData>;
  }) => ReactNode;
  renderEditRowDialogContent?: (props: {
    internalEditComponents: ReactNode[];
    row: MRT_Row<TData>;
    table: MRT_TableInstance<TData>;
  }) => ReactNode;
  renderEmptyRowsFallback?: (props: {
    table: MRT_TableInstance<TData>;
  }) => ReactNode;
  renderGlobalFilterModeMenuItems?: (props: {
    internalFilterOptions: MRT_InternalFilterOption[];
    onSelectFilterMode: (filterMode: MRT_FilterOption) => void;
    table: MRT_TableInstance<TData>;
  }) => ReactNode[];
  renderRowActionMenuItems?: (props: {
    closeMenu: () => void;
    row: MRT_Row<TData>;
    staticRowIndex?: number;
    table: MRT_TableInstance<TData>;
  }) => ReactNode[] | undefined;
  renderRowActions?: (props: {
    cell: MRT_Cell<TData>;
    row: MRT_Row<TData>;
    staticRowIndex?: number;
    table: MRT_TableInstance<TData>;
  }) => ReactNode;
  renderToolbarAlertBannerContent?: (props: {
    groupedAlert: ReactNode | null;
    selectedAlert: ReactNode | null;
    table: MRT_TableInstance<TData>;
  }) => ReactNode;
  renderToolbarInternalActions?: (props: {
    table: MRT_TableInstance<TData>;
  }) => ReactNode;
  renderTopToolbar?:
    | ((props: { table: MRT_TableInstance<TData> }) => ReactNode)
    | ReactNode;
  renderTopToolbarCustomActions?: (props: {
    table: MRT_TableInstance<TData>;
  }) => ReactNode;
  rowNumberDisplayMode?: 'original' | 'static';
  rowPinningDisplayMode?:
    | 'bottom'
    | 'select-bottom'
    | 'select-sticky'
    | 'select-top'
    | 'sticky'
    | 'top'
    | 'top-and-bottom';
  rowVirtualizerInstanceRef?: RefObject<MRT_RowVirtualizer | null>;
  rowVirtualizerOptions?:
    | ((props: {
        table: MRT_TableInstance<TData>;
      }) => Partial<VirtualizerOptions<HTMLDivElement, HTMLTableRowElement>>)
    | Partial<VirtualizerOptions<HTMLDivElement, HTMLTableRowElement>>;
  selectAllMode?: 'all' | 'page';
  /**
   * Manage state externally any way you want, then pass it back into MRT.
   */
  state?: Partial<MRT_TableState<TData>>;
  actions?: Action<TData>[];
  deleteRowsFn?: ({
    rowsToDelete,
    table,
  }: OnDeleteActionContext<TData>) => Promise<void> | void;
  editRowFn?: ({
    rowToEdit,
    table,
  }: OnEditActionContext<TData>) => Promise<void> | void;
}

export interface MRT_ExportDefinition {
  name: string;
  label: string;
  formats: string[];
}

export interface MRT_ExportParams {
  format: string | null;
  exports: string[];
  separated_files: boolean;
  download: boolean;
  ids: string;
  type: 'download' | 'print';
  [key: string]: unknown;
}

export interface MRT_ExportFileResponse {
  filename: string;
  name: string;
  extension: string;
  content: string;
}

export interface MRT_ActiveExportsState {
  selectedExports: string[];
  selectedFormat: string | null;
  grouped: boolean;
}

export interface MRT_TableConfig<TData extends MRT_RowData> {
  columns: MRT_ColumnDef<TData, unknown>[];
  initialState?: Partial<MRT_TableState<TData>>;
  availableExports?: Record<string, MRT_ExportDefinition>;
  // Table-level form configuration — sections and future modal-level options.
  formConfig?: MRT_FormConfig<TData>;
}

export interface MRT_TableData<TData extends MRT_RowData> {
  data: TData[];
  rowCount: number;
  hasNextPage?: boolean;
}

export type UseServerTableStateOptions<TData extends MRT_RowData> = {
  initialState?: Partial<MRT_TableState<TData>>;
  saveState?: (state: MRT_TableState<TData>) => void;
  saveDebounceMs?: number;
};

export type UseServerTableStateReturn = {
  // Current state — pass into the table's `state` prop
  tableState: {
    filters: MRT_FiltersState;
    pagination: MRT_PaginationState;
    sorting: MRT_SortingState;
    grouping: MRT_GroupingState;
    columnSizing: MRT_ColumnSizingState;
    columnVisibility: MRT_VisibilityState;
    columnOrder?: MRT_ColumnOrderState;
    columnPinning: MRT_ColumnPinningState;
    density: MRT_DensityState;
    expanded: MRT_ExpandedState;
    rowSelection: MRT_RowSelectionState;
    activeExports?: MRT_ActiveExportsState;
  };
  // Handlers — pass into the table's `on*Change` props
  handlers: {
    onFiltersChange: OnChangeFn<MRT_FiltersState>;
    onPaginationChange: OnChangeFn<MRT_PaginationState>;
    onSortingChange: OnChangeFn<MRT_SortingState>;
    onGroupingChange: OnChangeFn<MRT_GroupingState>;
    onColumnSizingChange: OnChangeFn<MRT_ColumnSizingState>;
    onColumnVisibilityChange: OnChangeFn<MRT_VisibilityState>;
    onColumnOrderChange: OnChangeFn<MRT_ColumnOrderState>;
    onColumnPinningChange: OnChangeFn<MRT_ColumnPinningState>;
    onDensityChange: OnChangeFn<MRT_DensityState>;
    onExpandedChange: OnChangeFn<MRT_ExpandedState>;
    onRowSelectionChange: OnChangeFn<MRT_RowSelectionState>;
    onActiveExportsChange: Dispatch<
      SetStateAction<MRT_ActiveExportsState | undefined>
    >;
  };
  // Only these go into useEffect deps for the data fetch
  fetchTrigger: {
    filterRules: {
      rules: MRT_FilterRule[];
      logicOperator: MRT_FiltersLogicOperator;
    };
    pagination: MRT_PaginationState;
    sorting: MRT_SortingState;
    // Increments only when a column transitions from hidden to visible (false → true)
    columnVisibilityShowTrigger: number;
  };
};

export type ColumnType =
  | 'string'
  | 'number'
  | 'date'
  | 'dateTime'
  | 'enum'
  | 'icon'
  | 'dimension'
  | 'boolean'
  | 'actions'
  | 'object';

export type MRT_FilterOperator =
  | 'between'
  | 'contains'
  | 'current-month'
  | 'current-week'
  | 'endsWith'
  | 'equals'
  | 'from-today'
  | 'fuzzy'
  | 'greaterThan'
  | 'greaterThanOrEqualTo'
  | 'inArray'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'last-7-days'
  | 'last-month'
  | 'last-week'
  | 'lessThan'
  | 'lessThanOrEqualTo'
  | 'notContains'
  | 'notEquals'
  | 'startsWith'
  | 'to-today';

// A single named snapshot of the current filter state, saved by the user.
export interface MRT_SavedFilter {
  name: string;
  logicOperator: MRT_FiltersLogicOperator;
  rules: MRT_FilterRule[];
}

// Map of saved filters keyed by their user-defined name.
export type MRT_SavedFilters = Record<string, MRT_SavedFilter>;

export interface MRT_FilterRule {
  columnId: string;
  id: string;
  operator: MRT_FilterOperator;
  value: unknown;
}

export interface MRT_FiltersState {
  logicOperator: MRT_FiltersLogicOperator;
  rules: MRT_FilterRule[];
  pinnedFilters: Omit<MRT_FilterRule, 'value'>[];
}

export interface MRT_FilterOperatorEditComponentProps<
  TData extends MRT_RowData,
  TValue = unknown,
> {
  column: MRT_Column<TData, TValue>;
  onChange: (value: TValue) => void;
  rule: MRT_FilterRule;
  table: MRT_TableInstance<TData>;
}

// Describes the structural shape of a filter operator's value.
// Used to decide whether the existing value can be preserved when switching operators.
// 'single'   — scalar: string, number, boolean, or a single-select option
// 'multi'    — array of scalars (inArray operators)
// 'range'    — object with {from, to} fields (date/dateTime 'between')
// 'none'     — no user input needed (isEmpty / isNotEmpty)
// 'computed' — value is always auto-calculated by getInitialValue() (relative date operators)
export type MRT_FilterOperatorValueShape =
  | 'single'
  | 'multi'
  | 'range'
  | 'none'
  | 'computed';

export interface MRT_FilterOperatorDefinition<
  TData extends MRT_RowData,
  TValue = unknown,
> {
  id: MRT_FilterOperator;
  label: string;
  // Structural shape of the value — used to preserve value when switching between
  // operators that expect the same type of input.
  valueShape: MRT_FilterOperatorValueShape;
  // Controls when the quick filter commits the value to filters.rules.
  // 'commit' — text/number inputs: commits on Enter only (no fetch on every keystroke).
  // 'change' — selects/pickers/booleans: commits immediately on each onChange.
  // Defaults to 'change' when omitted.
  triggerMode?: 'commit' | 'change';
  getInitialValue: () => TValue;
  isValueEmpty: (value: TValue) => boolean;
  editComponent: (
    props: MRT_FilterOperatorEditComponentProps<TData, TValue>,
  ) => ReactNode;
}

export interface ColumnTypeResolver {
  createColumnDef: <TData extends MRT_RowData, TValue = unknown>(
    column: MRT_ColumnDef<TData, TValue>,
  ) => MRT_ColumnDef<TData, TValue>;
  getFilterOperators: <TData extends MRT_RowData, TValue = unknown>(
    column: MRT_ColumnDef<TData, TValue>,
  ) => MRT_FilterOperatorDefinition<TData, TValue>[];
  getFormFieldRenderer: <TData extends MRT_RowData>(
    column: MRT_ColumnDef<TData>,
    table: MRT_TableInstance<TData>,
  ) => ((props: MRT_FormFieldRenderProps<TData>) => ReactNode) | null;
}

// Controls the position of MRT_NewEntryModal on the screen.
// Mirrors the TModalPosition interface from the existing CustomModal component.
export interface MRT_ModalPosition {
  // Vertical alignment of the modal card.
  vertical: 'top' | 'center' | 'bottom';
  // Horizontal alignment of the modal card.
  horizontal: 'left' | 'center' | 'right';
  // Fine-tune vertical position as a percentage offset (-100 to 100). Default 10.
  verticalOffset?: number;
  // Fine-tune horizontal position as a percentage offset (-100 to 100). Default 0.
  horizontalOffset?: number;
}

// Style overrides for each visual section of MRT_NewEntryModal.
// Used as the value type for muiNewEntryModalProps on MRT_TableOptions.
export interface MRT_NewEntryModalOverrides {
  // Override the modal title — replaces the default localization key.
  title?: string;
  // Sx overrides for the outer content container (the white card).
  contentContainerSx?: SxProps<Theme>;
  // Sx overrides for the header row (title + close button).
  headerSx?: SxProps<Theme>;
  // Sx overrides for the scrollable body area.
  bodySx?: SxProps<Theme>;
  // Sx overrides for the footer row (action buttons).
  footerSx?: SxProps<Theme>;
  // Sx overrides for the MUI Modal backdrop/wrapper.
  modalSx?: SxProps<Theme>;
  // Additional props forwarded to the header Stack.
  headerProps?: Omit<StackProps, 'sx'>;
  // Additional props forwarded to the body Stack.
  bodyProps?: Omit<StackProps, 'sx'>;
  // Additional props forwarded to the footer Stack.
  footerProps?: Omit<StackProps, 'sx'>;
  // Props forwarded to the close (X) IconButton — color, sx, disabled, aria-label, onClick, etc.
  // When onClick is provided it runs BEFORE the default close handler.
  closeButtonProps?: IconButtonProps;
  // When true, hides the entire header row (title + close button).
  disableHeader?: boolean;
  // Controls the modal card position on screen.
  // When omitted, defaults to top-center with a 10% vertical offset.
  position?: MRT_ModalPosition;
  // Additional components rendered inside the header row, between the title and the close button.
  headerComponents?: ReactNode;
  // Full MUI Modal props passthrough — open, onClose, and sx are excluded (controlled internally).
  modalProps?: Omit<Partial<ModalProps>, 'open' | 'onClose' | 'sx'>;
}

// New entry modal state — open/close, mode (create or edit), and optional initial values.
export interface MRT_NewEntryModalState {
  // Whether the modal is currently open.
  open: boolean;
  // Whether the modal is in create or edit mode. Defaults to 'create' when not provided.
  mode?: 'create' | 'edit';
  // Initial values to pre-populate the form fields.
  // For edit mode: pass row.original. For create mode: pass field defaults or leave undefined.
  initialValues?: Record<string, unknown>;
}

// ─── Form Field Configuration ────────────────────────────────────────────────

// Props passed into a custom field render function — provides RHF name and column definition.
export interface MRT_FormFieldRenderProps<
  TData extends MRT_RowData,
  TValue = unknown,
> {
  // RHF field name — matches the column accessor key, used for register/Controller.
  name: string;
  // Column definition — provides header, type, and other column metadata.
  columnDef: MRT_ColumnDef<TData, TValue>;
}

// Configuration for a single form field — placed on a column definition via `formConfig`.
export interface MRT_FormFieldConfig<
  TData extends MRT_RowData,
  TValue = unknown,
> {
  // Disables this field in the form — all data columns are enabled by default, this is an opt-out flag.
  disabled?: boolean;
  // Render order inside the section. Lower number = rendered first. Fields without order appear last.
  order?: number;
  // Label override — replaces the column header text as the field label.
  label?: string;
  // Input placeholder text.
  placeholder?: string;
  // Helper text rendered below the input.
  helperText?: string;
  // ID of the section this field belongs to — must match MRT_FormSectionConfig.id.
  section?: string;
  // Initial value for the field. Only applied in create mode — ignored in edit mode.
  defaultValue?: TValue | (() => TValue);
  // React Hook Form validation rules applied to this field.
  rules?: RegisterOptions;
  // Custom render function — replaces the default input component for this field.
  render?: (props: MRT_FormFieldRenderProps<TData, TValue>) => ReactNode;
  // Intercepts RHF onChange — receives the new value and field name.
  // Return a transformed value to override what RHF stores, or return void to keep the original value.
  onChange?: (value: TValue, fieldName: string) => TValue | void;
}

// Props passed into form-level callbacks (onSave, onCancel) and custom action button handlers.
export interface MRT_FormCallbackProps<TData extends MRT_RowData> {
  // React Hook Form instance — provides values, setValue, watch, reset, formState, trigger, etc.
  form: UseFormReturn;
  // The table instance — provides access to state, options, and setters.
  // To close the modal, call table.setNewEntryModal({ open: false }) from within the callback.
  table: MRT_TableInstance<TData>;
  // Whether the form was opened in create or edit mode.
  // Use this in onSave to decide between POST (create) and PUT/PATCH (edit).
  mode: 'create' | 'edit';
}

// A single custom element rendered in the form footer alongside the default Save/Cancel buttons.
// Can be a button, input, link, or any other element — full control via the render function.
export interface MRT_FormCustomAction<TData extends MRT_RowData> {
  // Used as the React key for this action — must be unique within the customActions array.
  key: string;
  // Render function — receives current form values, table instance, and closeModal.
  render: (props: MRT_FormCallbackProps<TData>) => ReactNode;
}

// Render props for an additional form field — no columnDef since this field is not tied to a column.
export interface MRT_FormAdditionalFieldRenderProps<TData extends MRT_RowData> {
  // RHF field name — use this with register/Controller.
  name: string;
  // The table instance — provides access to state, options, and setters.
  table: MRT_TableInstance<TData>;
}

// A form field not tied to any column — has all the same options as MRT_FormFieldConfig,
// plus a required name and a required render function that receives name and table instead of columnDef.
export interface MRT_FormAdditionalField<
  TData extends MRT_RowData,
  TValue = unknown,
> extends Omit<MRT_FormFieldConfig<TData, TValue>, 'render'> {
  // Unique name — used as the RHF field name. Must not conflict with any column accessor key.
  name: string;
  // Render function — required since there is no column type resolver to fall back on.
  // Receives name and table instead of columnDef.
  render: (props: MRT_FormAdditionalFieldRenderProps<TData>) => ReactNode;
}

// Table-level form configuration for create/edit modals.
export interface MRT_FormConfig<TData extends MRT_RowData> {
  // Section definitions — fields reference a section by id via MRT_FormFieldConfig.section.
  sections?: MRT_FormSectionConfig[];
  // Column IDs to exclude from the form — all data columns are shown by default.
  // Display columns (actions, checkboxes, etc.) are always excluded automatically.
  excludeColumns?: string[];
  // Called when the user submits the form successfully.
  onSave?: (props: MRT_FormCallbackProps<TData>) => Promise<void> | void;
  // Called when the user cancels — runs before the modal closes.
  onCancel?: (props: MRT_FormCallbackProps<TData>) => void;
  // Extra fields rendered alongside column-derived fields — use for inputs not backed by a column.
  additionalFields?: MRT_FormAdditionalField<TData>[];
  // Additional buttons rendered in the modal footer alongside the default Save/Cancel buttons.
  customActions?: MRT_FormCustomAction<TData>[];
  // Replaces the entire form component — when provided, no fields or sections are rendered by default.
  renderForm?: (props: MRT_FormCallbackProps<TData>) => ReactNode;
  // Replaces the entire MUI Dialog — when provided, the default modal wrapper is not rendered at all.
  // Use this to render a custom modal, drawer, or any other overlay instead.
  // Unlike renderForm, there is no RHF context — the consumer owns the full overlay lifecycle.
  // To close the modal, call table.setCreatingRow(null) from within the rendered component.
  renderModal?: (props: { table: MRT_TableInstance<TData> }) => ReactNode;
}

// Section definition — referenced by form field config via MRT_FormFieldConfig.section.
export interface MRT_FormSectionConfig {
  // Unique identifier — referenced by MRT_FormFieldConfig.section to assign a field to this section.
  id: string;
  // Section heading displayed above the group of fields.
  title: string;
  // Render order of this section relative to others. Lower number = rendered first.
  order?: number;
  // Whether this section can be collapsed by the user.
  collapsible?: boolean;
  // Initial collapsed state when the form opens.
  defaultCollapsed?: boolean;
}
