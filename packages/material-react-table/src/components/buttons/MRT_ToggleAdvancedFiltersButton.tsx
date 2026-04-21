import Badge from '@mui/material/Badge';
import Button, { type ButtonProps } from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { MRT_AdvancedFilters } from '../advanced-filters/MRT_AdvancedFilters';

export interface MRT_ToggleAdvancedFiltersButtonProps<TData extends MRT_RowData>
  extends Omit<ButtonProps, 'children'> {
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
  const { filters, showAdvancedFilters } = getState();

  if (!manualFiltering) {
    return null;
  }

  // Count applied filter rules to display on the badge
  const activeFilterCount = filters.rules.length;

  const handleToggleShowAdvancedFilters = () => {
    setShowAdvancedFilters((prev) => !prev);
  };

  const FilterIcon = showAdvancedFilters ? FilterListOffIcon : FilterListIcon;

  return (
    <>
      <Tooltip title={rest?.title ?? localization.showAdvancedFilters}>
        {/* Badge wraps the button; invisible when no filters are active */}
        <Badge
          badgeContent={activeFilterCount}
          color="primary"
          invisible={activeFilterCount === 0}
        >
          <Button
            aria-label={localization.showAdvancedFilters}
            onClick={handleToggleShowAdvancedFilters}
            size="small"
            startIcon={<FilterIcon />}
            variant="text"
            {...rest}
            title={undefined}
          >
            {localization.filters}
          </Button>
        </Badge>
      </Tooltip>
      <MRT_AdvancedFilters table={table} />
    </>
  );
};
