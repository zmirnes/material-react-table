import { type Row } from '@tanstack/react-table';
import Box from '@mui/material/Box';
import { type IconButtonProps } from '@mui/material/IconButton';
import { useMRT_SliceValue } from '../../hooks/useMRT_SliceValue';
import { type MRT_Features } from '../../mrtTableFeatures';
import { MRT_RowPinButton } from '../buttons/MRT_RowPinButton';
import {
  type MRT_Row,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_TableBodyRowPinButtonProps<TData extends MRT_RowData>
  extends IconButtonProps {
  row: MRT_Row<TData>;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableBodyRowPinButton = <TData extends MRT_RowData>({
  row,
  table,
  ...rest
}: MRT_TableBodyRowPinButtonProps<TData>) => {
  const {
    options: { enableRowPinning, rowPinningDisplayMode },
  } = table;
  const density = useMRT_SliceValue(table._uiStore, (s) => s.density);

  const canPin = parseFromValuesOrFunc(
    enableRowPinning,
    row as unknown as Row<MRT_Features, TData>,
  );

  if (!canPin) return null;

  const rowPinButtonProps = {
    row,
    table,
    ...rest,
  };

  if (rowPinningDisplayMode === 'top-and-bottom' && !row.getIsPinned()) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: density === 'compact' ? 'row' : 'column',
        }}
      >
        <MRT_RowPinButton pinningPosition="top" {...rowPinButtonProps} />
        <MRT_RowPinButton pinningPosition="bottom" {...rowPinButtonProps} />
      </Box>
    );
  }

  return (
    <MRT_RowPinButton
      pinningPosition={rowPinningDisplayMode === 'bottom' ? 'bottom' : 'top'}
      {...rowPinButtonProps}
    />
  );
};
