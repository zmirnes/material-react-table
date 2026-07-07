import Box from '@mui/material/Box';
import TableContainer, {
  type TableContainerProps,
} from '@mui/material/TableContainer';
import { MRT_CellActionMenu } from '../menus/MRT_CellActionMenu';
import { MRT_EditRowModal } from '../modals/MRT_EditRowModal';
import { MRT_NewEntryModal } from '../modals/MRT_NewEntryModal';
import { MRT_Table } from './MRT_Table';
import { MRT_TableLoadingOverlay } from './MRT_TableLoadingOverlay';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_TableContainerProps<TData extends MRT_RowData>
  extends TableContainerProps {
  table: MRT_TableInstance<TData>;
}

export const MRT_TableContainer = <TData extends MRT_RowData>({
  table,
  ...rest
}: MRT_TableContainerProps<TData>) => {
  const {
    getState,
    options: {
      createDisplayMode,
      editDisplayMode,
      enableCellActions,
      enableRowVirtualization,
      muiTableContainerProps,
    },
    refs: { resizeIndicatorRef, tableContainerRef },
  } = table;
  const {
    actionCell,
    creatingRow,
    editingRow,
    isLoading,
    showLoadingOverlay,
    newEntryModal,
  } = getState();

  const loading =
    showLoadingOverlay !== false && (isLoading || showLoadingOverlay);

  const tableContainerProps = {
    ...parseFromValuesOrFunc(muiTableContainerProps, {
      table,
    }),
    ...rest,
  };

  const createModalOpen = createDisplayMode === 'modal' && creatingRow;
  const editModalOpen = editDisplayMode === 'modal' && editingRow;

  return (
    <TableContainer
      aria-busy={loading}
      aria-describedby={loading ? 'mrt-progress' : undefined}
      {...tableContainerProps}
      ref={(node: HTMLDivElement) => {
        if (node) {
          tableContainerRef.current = node;
          if (tableContainerProps?.ref) {
            //@ts-expect-error
            tableContainerProps.ref.current = node;
          }
        }
      }}
      style={{
        ...tableContainerProps?.style,
      }}
      sx={(theme) => ({
        flex: '1 1 auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '100%',
        overflow: 'auto',
        position: 'relative',
        //chromium scrolls a tall virtualized table sluggishly without these
        //(isolates layout/paint work to this subtree and warms up
        //compositing) — see tanstack/virtual#860
        ...(enableRowVirtualization
          ? { contain: 'paint', willChange: 'transform' }
          : null),
        '&[data-mrt-resizing]': {
          userSelect: 'none',
        },
        '&[data-mrt-resizing] .Mui-TableHeadCell-Content-Actions': {
          visibility: 'hidden',
        },
        ...(parseFromValuesOrFunc(tableContainerProps?.sx, theme) as Record<
          string,
          unknown
        >),
      })}
    >
      {loading ? <MRT_TableLoadingOverlay table={table} /> : null}
      <Box
        ref={resizeIndicatorRef}
        sx={{
          bgcolor: 'primary.main',
          bottom: 0,
          display: 'none',
          left: 0,
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          width: '2px',
          zIndex: 3,
        }}
      />
      <MRT_Table table={table} />
      {(createModalOpen || editModalOpen) && (
        <MRT_EditRowModal open table={table} />
      )}
      {newEntryModal.open && <MRT_NewEntryModal table={table} />}
      {enableCellActions && actionCell && <MRT_CellActionMenu table={table} />}
    </TableContainer>
  );
};
