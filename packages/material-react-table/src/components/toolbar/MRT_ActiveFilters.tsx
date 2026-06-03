import Stack from '@mui/material/Stack';
import { MRT_ActiveFilterItem } from './MRT_ActiveFilterItem';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

interface MRT_ActiveFiltersProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
}

export const MRT_ActiveFilters = <TData extends MRT_RowData>({
  table,
}: MRT_ActiveFiltersProps<TData>) => {
  const { getState } = table;

  const { filters } = getState();
  const hasFilters = filters.rules.length > 0;

  if (!hasFilters) return null;

  return (
    <Stack
      data-testid="active-filters-container"
      gap={1}
      direction="row"
      p={1}
      sx={{
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {filters.rules.map((rule) => (
        <MRT_ActiveFilterItem key={rule.id} table={table} rule={rule} />
      ))}
    </Stack>
  );
};
