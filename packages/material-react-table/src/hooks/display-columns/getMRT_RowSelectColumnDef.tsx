import Box from '@mui/material/Box';
import { MRT_SelectAllMenu } from '../../components/inputs/MRT_SelectAllMenu';
import { MRT_SelectCheckbox } from '../../components/inputs/MRT_SelectCheckbox';
import {
  type MRT_ColumnDef,
  type MRT_RowData,
  type MRT_StatefulTableOptions,
} from '../../types';
import { defaultDisplayColumnProps } from '../../utils/displayColumn.utils';

export const getMRT_RowSelectColumnDef = <TData extends MRT_RowData>(
  tableOptions: MRT_StatefulTableOptions<TData>,
): MRT_ColumnDef<TData> => {
  const { enableMultiRowSelection, enableSelectAll } = tableOptions;

  return {
    Cell: ({ row, staticRowIndex, table }) => (
      <MRT_SelectCheckbox
        row={row}
        staticRowIndex={staticRowIndex}
        table={table}
      />
    ),
    Header:
      enableSelectAll && enableMultiRowSelection
        ? ({ table }) => (
            <Box sx={{ alignItems: 'center', display: 'flex' }}>
              {/* Checkbox: selects/deselects all rows on current page */}
              <MRT_SelectCheckbox table={table} />
              {/* Three-dots menu: current page or all pages */}
              <MRT_SelectAllMenu table={table} />
            </Box>
          )
        : undefined,
    grow: false,
    ...defaultDisplayColumnProps({
      header: 'select',
      id: '__check__',
      size: enableSelectAll ? 90 : 70, // widened from 60 to accommodate both the checkbox and the menu button
      tableOptions,
    }),
  };
};
