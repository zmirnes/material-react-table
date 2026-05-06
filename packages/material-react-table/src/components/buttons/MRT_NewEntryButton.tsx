import Button, { type ButtonProps } from '@mui/material/Button';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_NewEntryButtonProps<TData extends MRT_RowData>
  extends ButtonProps {
  table: MRT_TableInstance<TData>;
}

export const MRT_NewEntryButton = <TData extends MRT_RowData>({
  table,
  ...rest
}: MRT_NewEntryButtonProps<TData>) => {
  const {
    options: {
      icons: { AddIcon },
      localization,
    },
    setNewEntryModal,
  } = table;

  const handleOpenNewEntryModal = () => {
    setNewEntryModal({ open: true });
  };

  return (
    <Button
      onClick={handleOpenNewEntryModal}
      startIcon={<AddIcon />}
      variant="contained"
      {...rest}
    >
      {localization.add}
    </Button>
  );
};
