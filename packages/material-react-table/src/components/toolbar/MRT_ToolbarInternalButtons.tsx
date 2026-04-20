import Box, { type BoxProps } from '@mui/material/Box';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { MRT_SavedFiltersButton } from '../advanced-filters/MRT_SavedFiltersButton';
import { MRT_ShowHideColumnsButton } from '../buttons/MRT_ShowHideColumnsButton';
import { MRT_ToggleAdvancedFiltersButton } from '../buttons/MRT_ToggleAdvancedFiltersButton';
import { MRT_ToggleDensePaddingButton } from '../buttons/MRT_ToggleDensePaddingButton';
import { MRT_ToggleFiltersButton } from '../buttons/MRT_ToggleFiltersButton';
import { MRT_ToggleFullScreenButton } from '../buttons/MRT_ToggleFullScreenButton';
import { MRT_ToggleGlobalFilterButton } from '../buttons/MRT_ToggleGlobalFilterButton';

export interface MRT_ToolbarInternalButtonsProps<TData extends MRT_RowData>
  extends BoxProps {
  table: MRT_TableInstance<TData>;
}

export const MRT_ToolbarInternalButtons = <TData extends MRT_RowData>({
  table,
  ...rest
}: MRT_ToolbarInternalButtonsProps<TData>) => {
  const {
    options: {
      columnFilterDisplayMode,
      enableColumnFilters,
      enableColumnOrdering,
      enableColumnPinning,
      enableDensityToggle,
      enableFilters,
      enableFullScreenToggle,
      enableGlobalFilter,
      enableHiding,
      initialState,
      enableAdvancedFilters,
      renderToolbarInternalActions,
    },
  } = table;

  return (
    <Box
      {...rest}
      sx={(theme) => ({
        alignItems: 'center',
        display: 'flex',
        zIndex: 3,
        gap: 1,
        ...(parseFromValuesOrFunc(rest?.sx, theme) as any),
      })}
    >
      {renderToolbarInternalActions?.({
        table,
      }) ?? (
        <>
          {enableFilters &&
            enableGlobalFilter &&
            !initialState?.showGlobalFilter && (
              <MRT_ToggleGlobalFilterButton table={table} />
            )}
          {enableFilters &&
            enableColumnFilters &&
            columnFilterDisplayMode !== 'popover' && (
              <MRT_ToggleFiltersButton table={table} />
            )}
          {(enableHiding || enableColumnOrdering || enableColumnPinning) && (
            <MRT_ShowHideColumnsButton table={table} />
          )}
          {enableDensityToggle && (
            <MRT_ToggleDensePaddingButton table={table} />
          )}
          {enableFullScreenToggle && (
            <MRT_ToggleFullScreenButton table={table} />
          )}
          {enableAdvancedFilters && (
            <MRT_ToggleAdvancedFiltersButton table={table} />
          )}
          {/* Saved filters dropdown — shown directly in toolbar for quick access */}
          {enableAdvancedFilters && <MRT_SavedFiltersButton table={table} />}
        </>
      )}
    </Box>
  );
};
