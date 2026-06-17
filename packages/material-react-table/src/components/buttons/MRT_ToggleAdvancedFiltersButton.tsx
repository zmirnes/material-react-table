import Badge from '@mui/material/Badge';
import Button, { type ButtonProps } from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { MRT_AdvancedFilters } from '../advanced-filters/MRT_AdvancedFilters';
import {
  MRT_AdvancedFiltersProvider,
  useMRT_AdvancedFiltersContext,
} from '../advanced-filters/MRT_AdvancedFiltersContext';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_ToggleAdvancedFiltersButtonProps<TData extends MRT_RowData>
  extends Omit<ButtonProps, 'children'> {
  table: MRT_TableInstance<TData>;
}

const MRT_ToggleAdvancedFiltersButtonInner = <TData extends MRT_RowData>({
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
  } = table;
  const { filters } = getState();
  const { showAdvancedFilters, setShowAdvancedFilters } =
    useMRT_AdvancedFiltersContext();

  if (!manualFiltering) {
    return null;
  }

  const activeFilterCount = filters.rules.length;

  const FilterIcon = showAdvancedFilters ? FilterListOffIcon : FilterListIcon;

  return (
    <>
      <Tooltip title={rest?.title ?? localization.showAdvancedFilters}>
        <Badge
          badgeContent={activeFilterCount}
          color="primary"
          invisible={activeFilterCount === 0}
        >
          <Button
            aria-label={localization.showAdvancedFilters}
            onClick={() => setShowAdvancedFilters((prev) => !prev)}
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

export const MRT_ToggleAdvancedFiltersButton = <TData extends MRT_RowData>({
  table,
  ...rest
}: MRT_ToggleAdvancedFiltersButtonProps<TData>) => {
  const initialOpen =
    table.options.initialState?.showAdvancedFilters ??
    Boolean(
      table.options.enableAdvancedFilters && table.options.manualFiltering,
    );

  return (
    <MRT_AdvancedFiltersProvider
      initialOpen={initialOpen}
      setterRef={table._showAdvancedFiltersSetterRef}
    >
      <MRT_ToggleAdvancedFiltersButtonInner table={table} {...rest} />
    </MRT_AdvancedFiltersProvider>
  );
};
