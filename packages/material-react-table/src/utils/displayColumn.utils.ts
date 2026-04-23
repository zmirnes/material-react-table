import {
  type MRT_DefinedTableOptions,
  type MRT_DisplayColumnDef,
  type MRT_DisplayColumnIds,
  type MRT_Localization,
  type MRT_RowData,
  type MRT_StatefulTableOptions,
} from '../types';
import { getAllLeafColumnDefs, getColumnId } from './column.utils';

export function defaultDisplayColumnProps<TData extends MRT_RowData>({
  header,
  id,
  size,
  tableOptions,
}: {
  header?: keyof MRT_Localization;
  id: MRT_DisplayColumnIds;
  size: number;
  tableOptions: MRT_DefinedTableOptions<TData>;
}): MRT_DisplayColumnDef<TData> {
  const { defaultDisplayColumn, displayColumnDefOptions, localization } =
    tableOptions;
  return {
    ...defaultDisplayColumn,
    header: header ? localization[header]! : '',
    size,
    ...displayColumnDefOptions?.[id],
    id,
  } as MRT_DisplayColumnDef<TData>;
}

export const showRowPinningColumn = <TData extends MRT_RowData>(
  tableOptions: MRT_StatefulTableOptions<TData>,
): boolean => {
  const { enableRowPinning, rowPinningDisplayMode } = tableOptions;
  return !!(enableRowPinning && !rowPinningDisplayMode?.startsWith('select'));
};

export const showRowDragColumn = <TData extends MRT_RowData>(
  tableOptions: MRT_StatefulTableOptions<TData>,
): boolean => {
  const { enableRowDragging, enableRowOrdering } = tableOptions;
  return !!(enableRowDragging || enableRowOrdering);
};

export const showRowExpandColumn = <TData extends MRT_RowData>(
  tableOptions: MRT_StatefulTableOptions<TData>,
): boolean => {
  const {
    enableExpanding,
    enableGrouping,
    renderDetailPanel,
    state: { grouping },
  } = tableOptions;
  return !!(
    enableExpanding ||
    (enableGrouping && grouping?.length) ||
    renderDetailPanel
  );
};

export const showRowActionsColumn = <TData extends MRT_RowData>(
  tableOptions: MRT_StatefulTableOptions<TData>,
): boolean => {
  const {
    createDisplayMode,
    editDisplayMode,
    enableEditing,
    enableRowActions,
    state: { creatingRow },
  } = tableOptions;
  return !!(
    enableRowActions ||
    (creatingRow && createDisplayMode === 'row') ||
    (enableEditing && ['modal', 'row'].includes(editDisplayMode ?? ''))
  );
};

export const showRowSelectionColumn = <TData extends MRT_RowData>(
  tableOptions: MRT_StatefulTableOptions<TData>,
): boolean => !!tableOptions.enableRowSelection;

export const showRowNumbersColumn = <TData extends MRT_RowData>(
  tableOptions: MRT_StatefulTableOptions<TData>,
): boolean => !!tableOptions.enableRowNumbers;

export const showRowSpacerColumn = <TData extends MRT_RowData>(
  tableOptions: MRT_StatefulTableOptions<TData>,
): boolean => tableOptions.layoutMode === 'grid-no-grow';

export const getLeadingDisplayColumnIds = <TData extends MRT_RowData>(
  tableOptions: MRT_StatefulTableOptions<TData>,
) =>
  [
    showRowPinningColumn(tableOptions) && 'mrt-row-pin',
    showRowDragColumn(tableOptions) && 'mrt-row-drag',
    tableOptions.positionActionsColumn === 'first' &&
      showRowActionsColumn(tableOptions) &&
      'mrt-row-actions',
    tableOptions.positionExpandColumn === 'first' &&
      showRowExpandColumn(tableOptions) &&
      'mrt-row-expand',
    showRowSelectionColumn(tableOptions) && '__check__',
    showRowNumbersColumn(tableOptions) && 'mrt-row-numbers',
  ].filter(Boolean) as MRT_DisplayColumnIds[];

export const getTrailingDisplayColumnIds = <TData extends MRT_RowData>(
  tableOptions: MRT_StatefulTableOptions<TData>,
) =>
  [
    tableOptions.positionActionsColumn === 'last' &&
      showRowActionsColumn(tableOptions) &&
      'mrt-row-actions',
    tableOptions.positionExpandColumn === 'last' &&
      showRowExpandColumn(tableOptions) &&
      'mrt-row-expand',
    showRowSpacerColumn(tableOptions) && 'mrt-row-spacer',
  ].filter(Boolean) as MRT_DisplayColumnIds[];

/** The internal ID used by TanStack Table for the row-selection checkbox column */
export const CHECKBOX_DISPLAY_COLUMN_ID = '__check__';

/**
 * Builds the default columnPinning state so that the checkbox column
 * is always the first (leftmost) sticky column when row selection is enabled.
 * The checkbox is pinned for sticky positioning only — its visual styles are
 * intentionally overridden in style.utils.ts to match center column appearance.
 * Any user-supplied left-pinned column IDs are kept, but appended after the
 * checkbox so they never appear to its left.
 */
export const getDefaultColumnPinningState = <TData extends MRT_RowData>(
  tableOptions: MRT_StatefulTableOptions<TData>,
  existingColumnPinning: { left?: string[]; right?: string[] } = {},
): { left: string[]; right: string[] } => {
  const existingLeft = existingColumnPinning.left ?? [];
  const existingRight = existingColumnPinning.right ?? [];

  // Only pin the checkbox automatically when the column is actually rendered
  if (!showRowSelectionColumn(tableOptions)) {
    return { left: existingLeft, right: existingRight };
  }

  // Remove checkbox from wherever it is, then force it to the front of left
  const leftWithoutCheckbox = existingLeft.filter(
    (colId) => colId !== CHECKBOX_DISPLAY_COLUMN_ID,
  );

  return {
    left: [CHECKBOX_DISPLAY_COLUMN_ID, ...leftWithoutCheckbox],
    right: existingRight,
  };
};

export const getDefaultColumnOrderIds = <TData extends MRT_RowData>(
  tableOptions: MRT_StatefulTableOptions<TData>,
  reset = false,
) => {
  const {
    state: { columnOrder: currentColumnOrderIds = [] },
  } = tableOptions;

  const leadingDisplayColIds: string[] =
    getLeadingDisplayColumnIds(tableOptions);
  const trailingDisplayColIds: string[] =
    getTrailingDisplayColumnIds(tableOptions);

  const defaultColumnDefIds = getAllLeafColumnDefs(tableOptions.columns).map(
    (columnDef) => getColumnId(columnDef),
  );

  let allLeafColumnDefIds = reset
    ? defaultColumnDefIds
    : Array.from(new Set([...currentColumnOrderIds, ...defaultColumnDefIds]));

  allLeafColumnDefIds = allLeafColumnDefIds.filter(
    (colId) =>
      !leadingDisplayColIds.includes(colId) &&
      !trailingDisplayColIds.includes(colId),
  );

  return [
    ...leadingDisplayColIds,
    ...allLeafColumnDefIds,
    ...trailingDisplayColIds,
  ];
};
