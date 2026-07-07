import { useMemo } from 'react';
import Table, { type TableProps } from '@mui/material/Table';
import { useMRT_ColumnVirtualizer } from '../../hooks/useMRT_ColumnVirtualizer';
import { MRT_TableBody, Memo_MRT_TableBody } from '../body/MRT_TableBody';
import { MRT_TableFooter } from '../footer/MRT_TableFooter';
import { MRT_TableHead } from '../head/MRT_TableHead';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseCSSVarId } from '../../utils/style.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_TableProps<TData extends MRT_RowData> extends TableProps {
  table: MRT_TableInstance<TData>;
}

export const MRT_Table = <TData extends MRT_RowData>({
  table,
  ...rest
}: MRT_TableProps<TData>) => {
  const {
    getFlatHeaders,
    getState,
    options: {
      columns,
      enableStickyHeader,
      enableTableFooter,
      enableTableHead,
      layoutMode,
      memoMode,
      muiTableProps,
      renderCaption,
    },
    refs: { tableRef },
  } = table;
  const { columnSizing, columnVisibility, density } = getState();

  const tableProps = {
    ...parseFromValuesOrFunc(muiTableProps, { table }),
    ...rest,
  };

  const Caption = parseFromValuesOrFunc(renderCaption, { table });

  const columnSizeVars = useMemo(() => {
    const headers = getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const colSize = header.getSize();
      colSizes[`--header-${parseCSSVarId(header.id)}-size`] = colSize;
      colSizes[`--col-${parseCSSVarId(header.column.id)}-size`] = colSize;
    }
    return colSizes;
  }, [columns, columnSizing, columnVisibility]);

  // Padding values keyed off density, read by cell/header/footer sx so density toggles
  // reuse existing emotion classes instead of generating new ones per cell.
  const densityVars = useMemo(
    () => ({
      '--mrt-cell-p':
        density === 'compact'
          ? '0.5rem'
          : density === 'comfortable'
            ? '1rem'
            : '1.5rem',
      '--mrt-display-cell-p':
        density === 'compact'
          ? '0 0.5rem'
          : density === 'comfortable'
            ? '0.5rem 0.75rem'
            : '1rem 1.25rem',
      '--mrt-head-display-cell-p':
        density === 'compact'
          ? '0.5rem'
          : density === 'comfortable'
            ? '0.75rem'
            : '1rem 1.25rem',
      '--mrt-head-cell-pb': density === 'compact' ? '0.4rem' : '0.6rem',
      '--mrt-head-cell-pt':
        density === 'compact'
          ? '0.25rem'
          : density === 'comfortable'
            ? '.75rem'
            : '1.25rem',
    }),
    [density],
  );

  const columnVirtualizer = useMRT_ColumnVirtualizer(table);

  const commonTableGroupProps = {
    columnVirtualizer,
    table,
  };

  return (
    <Table
      stickyHeader={enableStickyHeader}
      {...tableProps}
      ref={(node: HTMLTableElement) => {
        if (node) {
          tableRef.current = node;
          const userRef = tableProps?.ref;
          if (typeof userRef === 'function') {
            userRef(node);
          } else if (userRef) {
            userRef.current = node;
          }
        }
      }}
      style={{ ...columnSizeVars, ...densityVars, ...tableProps?.style }}
      sx={(theme) => ({
        borderCollapse: 'separate',
        display: layoutMode?.startsWith('grid') ? 'grid' : undefined,
        overflow: 'visible',
        position: 'relative',
        ...(parseFromValuesOrFunc(tableProps?.sx, theme) as Record<
          string,
          unknown
        >),
      })}
    >
      {!!Caption && <caption>{Caption}</caption>}
      {enableTableHead && <MRT_TableHead {...commonTableGroupProps} />}
      {memoMode === 'table-body' ? (
        <Memo_MRT_TableBody {...commonTableGroupProps} />
      ) : (
        <MRT_TableBody {...commonTableGroupProps} />
      )}
      {enableTableFooter && <MRT_TableFooter {...commonTableGroupProps} />}
    </Table>
  );
};
