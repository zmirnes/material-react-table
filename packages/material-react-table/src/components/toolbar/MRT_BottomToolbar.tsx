import Box, { type BoxProps } from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { getCommonToolbarStyles } from '../../utils/style.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { MRT_LinearProgressBar } from './MRT_LinearProgressBar';
import { MRT_SelectionCountBadge } from './MRT_SelectionCountBadge';
import { MRT_TablePagination } from './MRT_TablePagination';
import { MRT_ToolbarDropZone } from './MRT_ToolbarDropZone';
import { MRT_TotalRowsCounter } from './MRT_TotalRowsCounter';

export interface MRT_BottomToolbarProps<TData extends MRT_RowData>
  extends BoxProps {
  table: MRT_TableInstance<TData>;
}

export const MRT_BottomToolbar = <TData extends MRT_RowData>({
  table,
  ...rest
}: MRT_BottomToolbarProps<TData>) => {
  const {
    getState,
    options: {
      enablePagination,
      enableRowSelection,
      muiBottomToolbarProps,
      positionPagination,
      positionToolbarDropZone,
      renderBottomToolbarCustomActions,
    },
    refs: { bottomToolbarRef },
  } = table;
  const { isFullScreen } = getState();

  const toolbarProps = {
    ...parseFromValuesOrFunc(muiBottomToolbarProps, { table }),
    ...rest,
  };

  return (
    <Box
      {...toolbarProps}
      ref={(node: HTMLDivElement) => {
        if (node) {
          bottomToolbarRef.current = node;
          if (toolbarProps?.ref) {
            // @ts-expect-error
            toolbarProps.ref.current = node;
          }
        }
      }}
      sx={(theme) => ({
        ...getCommonToolbarStyles({ table, theme }),
        bottom: isFullScreen ? '0' : undefined,
        boxShadow: `0 1px 2px -1px ${alpha(
          theme.palette.grey[700],
          0.5,
        )} inset`,
        left: 0,
        position: isFullScreen ? 'fixed' : 'relative',
        right: 0,
        ...(parseFromValuesOrFunc(toolbarProps?.sx, theme) as any),
      })}
    >
      <MRT_LinearProgressBar isTopToolbar={false} table={table} />
      {['both', 'bottom'].includes(positionToolbarDropZone ?? '') && (
        <MRT_ToolbarDropZone table={table} />
      )}
      <Box
        sx={{
          alignItems: 'center',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          p: '0.5rem',
          width: '100%',
          height: '100%',
        }}
      >
        {/* Left side: selection count badge + optional custom actions */}
        <Box sx={{ alignItems: 'center', display: 'flex', gap: '0.5rem' }}>
          {enableRowSelection && <MRT_SelectionCountBadge table={table} />}
          {renderBottomToolbarCustomActions?.({ table })}
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '0.5rem',
            position: 'relative',
            right: 0,
            top: 0,
          }}
        >
          <MRT_TotalRowsCounter table={table} />
          {enablePagination &&
            ['both', 'bottom'].includes(positionPagination ?? '') && (
              <MRT_TablePagination position="bottom" table={table} />
            )}
        </Box>
      </Box>
    </Box>
  );
};
