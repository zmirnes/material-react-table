import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useMRT_SliceValue } from '../../hooks/useMRT_SliceValue';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_ToggleGlobalFilterButtonProps<TData extends MRT_RowData>
  extends IconButtonProps {
  table: MRT_TableInstance<TData>;
}

export const MRT_ToggleGlobalFilterButton = <TData extends MRT_RowData>({
  table,
  ...rest
}: MRT_ToggleGlobalFilterButtonProps<TData>) => {
  const {
    getState,
    options: {
      icons: { SearchIcon, SearchOffIcon },

      localization,
    },
    refs: { searchInputRef },
    setShowGlobalFilter,
  } = table;
  const { globalFilter } = getState();
  const showGlobalFilter = useMRT_SliceValue(
    table._uiStore,
    (s) => s.showGlobalFilter,
  );

  const handleToggleSearch = () => {
    setShowGlobalFilter(!showGlobalFilter);
    queueMicrotask(() => searchInputRef.current?.focus());
  };

  return (
    <Tooltip title={rest?.title ?? localization.showHideSearch}>
      <span>
        <IconButton
          aria-label={rest?.title ?? localization.showHideSearch}
          disabled={!!globalFilter && showGlobalFilter}
          onClick={handleToggleSearch}
          {...rest}
          title={undefined}
        >
          {showGlobalFilter ? <SearchOffIcon /> : <SearchIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
};
