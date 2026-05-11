import TableHead, { type TableHeadProps } from '@mui/material/TableHead';
import { MRT_TableHeadRow } from './MRT_TableHeadRow';
import {
  type MRT_ColumnVirtualizer,
  type MRT_HeaderGroup,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_TableHeadProps<TData extends MRT_RowData>
  extends TableHeadProps {
  columnVirtualizer?: MRT_ColumnVirtualizer;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableHead = <TData extends MRT_RowData>({
  columnVirtualizer,
  table,
  ...rest
}: MRT_TableHeadProps<TData>) => {
  const {
    getState,
    options: { enableStickyHeader, layoutMode, muiTableHeadProps },
    refs: { tableHeadRef },
  } = table;
  const { isFullScreen } = getState();

  const tableHeadProps = {
    ...parseFromValuesOrFunc(muiTableHeadProps, { table }),
    ...rest,
  };

  const stickyHeader = enableStickyHeader || isFullScreen;

  return (
    <TableHead
      {...tableHeadProps}
      ref={(ref: HTMLTableSectionElement) => {
        tableHeadRef.current = ref;
        if (tableHeadProps?.ref) {
          // @ts-expect-error
          tableHeadProps.ref.current = ref;
        }
      }}
      sx={(theme) => ({
        display: layoutMode?.startsWith('grid') ? 'grid' : undefined,
        position: stickyHeader ? 'sticky' : 'relative',
        top: stickyHeader && layoutMode?.startsWith('grid') ? 0 : undefined,
        zIndex: stickyHeader ? 2 : undefined,
        ...(parseFromValuesOrFunc(tableHeadProps?.sx, theme) as Record<
          string,
          unknown
        >),
        borderBottom: `1px solid ${theme.palette.divider}`,
      })}
    >
      {table.getHeaderGroups().map((headerGroup) => (
        <MRT_TableHeadRow
          columnVirtualizer={columnVirtualizer}
          headerGroup={headerGroup as MRT_HeaderGroup<TData>}
          key={headerGroup.id}
          table={table}
        />
      ))}
    </TableHead>
  );
};
