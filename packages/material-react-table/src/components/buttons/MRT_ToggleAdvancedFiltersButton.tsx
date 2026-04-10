import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { MRT_AdvancedFilters } from '../advanced-filters/MRT_AdvancedFilters';

export interface MRT_ToggleAdvancedFiltersButtonProps<TData extends MRT_RowData>
  extends IconButtonProps {
  table: MRT_TableInstance<TData>;
}

export const MRT_ToggleAdvancedFiltersButton = <TData extends MRT_RowData>({
  table,
  ...rest
}: MRT_ToggleAdvancedFiltersButtonProps<TData>) => {
  const {
    getState,
    options: {
      icons: { FilterListIcon, FilterListOffIcon },
      localization,
      manualFiltering,
    },
    setShowAdvancedFilters,
  } = table;
  const { showAdvancedFilters } = getState();

  if (!manualFiltering) {
    return null;
  }

  const handleToggleShowAdvancedFilters = () => {
    setShowAdvancedFilters((prev) => !prev);
  };

  return (
    <>
      <Tooltip title={rest?.title ?? localization.showAdvancedFilters}>
        <IconButton
          aria-label={localization.showAdvancedFilters}
          onClick={handleToggleShowAdvancedFilters}
          {...rest}
          title={undefined}
        >
          {showAdvancedFilters ? <FilterListOffIcon /> : <FilterListIcon />}
        </IconButton>
      </Tooltip>
      <MRT_AdvancedFilters table={table} />
    </>
  );
};
