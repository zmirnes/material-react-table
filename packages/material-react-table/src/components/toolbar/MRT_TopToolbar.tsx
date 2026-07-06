import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { MRT_GlobalFilterTextField } from '../inputs/MRT_GlobalFilterTextField';
import MRT_TableOptions from '../options/MRT_TableOptions';
import { MRT_LinearProgressBar } from './MRT_LinearProgressBar';
import { MRT_TablePagination } from './MRT_TablePagination';
import { MRT_ToolbarDropZone } from './MRT_ToolbarDropZone';
import { MRT_ToolbarInternalButtons } from './MRT_ToolbarInternalButtons';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { getCommonToolbarStyles } from '../../utils/style.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';
import ToolbarActions from '../actions/ToolbarActions';

export interface MRT_TopToolbarProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
}

export const MRT_TopToolbar = <TData extends MRT_RowData>({
  table,
}: MRT_TopToolbarProps<TData>) => {
  const {
    options: {
      enableGlobalFilter,
      enablePagination,
      enableToolbarInternalActions,
      muiTopToolbarProps,
      positionGlobalFilter,
      positionPagination,
      positionToolbarDropZone,
      renderTopToolbarCustomActions,
    },
    refs: { topToolbarRef },
  } = table;

  const isTablet = useMediaQuery('(max-width:1024px)');

  const toolbarProps = parseFromValuesOrFunc(muiTopToolbarProps, { table });

  const globalFilterProps = {
    sx: !isTablet
      ? {
          zIndex: 2,
        }
      : undefined,
    table,
  };

  return (
    <Box
      data-testid="top-toolbar"
      {...toolbarProps}
      ref={(ref: HTMLDivElement) => {
        topToolbarRef.current = ref;
        if (toolbarProps?.ref) {
          // @ts-expect-error
          toolbarProps.ref.current = ref;
        }
      }}
      sx={(theme) => ({
        ...getCommonToolbarStyles({ table, theme }),
        position: 'relative',
        top: 'unset',
        backgroundColor: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}`,
        ...(parseFromValuesOrFunc(toolbarProps?.sx, theme) as Record<
          string,
          unknown
        >),
      })}
    >
      <Box
        sx={{
          alignItems: 'center',
          boxSizing: 'border-box',
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'space-between',
          py: '1rem',
          px: '0.5rem',
          width: '100%',
          position: 'relative',
        }}
      >
        <>
          {enableGlobalFilter && positionGlobalFilter === 'left' && (
            <MRT_GlobalFilterTextField {...globalFilterProps} />
          )}
          {enableToolbarInternalActions ? (
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexWrap: 'wrap-reverse',
                gap: '0.5rem',
              }}
            >
              {enableGlobalFilter && positionGlobalFilter === 'right' && (
                <MRT_GlobalFilterTextField {...globalFilterProps} />
              )}
              <MRT_ToolbarInternalButtons table={table} />
            </Box>
          ) : (
            enableGlobalFilter &&
            positionGlobalFilter === 'right' && (
              <MRT_GlobalFilterTextField {...globalFilterProps} />
            )
          )}
        </>
        <ToolbarActions table={table} />
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            gap: '0.5rem',
            marginLeft: 'auto',
          }}
        >
          {(enableToolbarInternalActions &&
            renderTopToolbarCustomActions?.({
              table,
            })) ?? <span />}
          <MRT_TableOptions table={table} />
        </Box>
      </Box>
      {['both', 'top'].includes(positionToolbarDropZone ?? '') && (
        <MRT_ToolbarDropZone table={table} />
      )}
      {enablePagination &&
        ['both', 'top'].includes(positionPagination ?? '') && (
          <MRT_TablePagination position="top" table={table} />
        )}
      <MRT_LinearProgressBar isTopToolbar table={table} />
    </Box>
  );
};
