import { type MouseEvent } from 'react';
import Button, { type ButtonProps } from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_NewEntryButtonProps<TData extends MRT_RowData>
  extends Omit<ButtonProps, 'children'> {
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
      newEntryButtonProps,
    },
    setNewEntryModal,
  } = table;

  const handleOpenNewEntryModal = (event: MouseEvent<HTMLButtonElement>) => {
    // Prevent bubbling to muiTableBodyRowProps onClick (row click handlers)
    event.stopPropagation();
    setNewEntryModal({ open: true });
  };

  // When the consumer supplies onClick via newEntryButtonProps (or rest), it fully
  // replaces handleOpenNewEntryModal below — matches the override convention used by
  // every other mui*ButtonProps option in this codebase.
  const buttonProps = {
    ...parseFromValuesOrFunc(newEntryButtonProps, { table }),
    ...rest,
  };

  return (
    <Tooltip title={buttonProps?.title ?? localization.newEntry}>
      <Button
        aria-label={localization.newEntry}
        onClick={handleOpenNewEntryModal}
        size="small"
        startIcon={<AddIcon fontSize="small" />}
        variant="text"
        {...buttonProps}
        title={undefined}
      >
        {buttonProps?.children ?? localization.newEntry}
      </Button>
    </Tooltip>
  );
};
