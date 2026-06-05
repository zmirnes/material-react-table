import Box from '@mui/material/Box';
import { columnTypeResolvers } from '../../column-types/registy';
import {
  type MRT_FilterRule,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import { getFilterColumn } from '../advanced-filters/utils';

interface MRT_ActiveFilterItemProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
  rule: MRT_FilterRule;
}

export const MRT_ActiveFilterItem = <TData extends MRT_RowData>({
  table,
  rule,
}: MRT_ActiveFilterItemProps<TData>) => {
  const column = getFilterColumn(table, rule.columnId);

  if (
    !column ||
    column.columnDef.type === 'actions' ||
    column.columnDef.type === 'object'
  ) {
    return null;
  }

  const columnType = column.columnDef.type;
  const resolver = columnType && columnTypeResolvers[columnType];

  return (
    <Box
      data-testid="active-filter-item"
      sx={{
        display: 'flex',
        gap: 1,
      }}
    >
      {resolver?.activeFilterRenderer?.(table, rule)}
    </Box>
  );
};
