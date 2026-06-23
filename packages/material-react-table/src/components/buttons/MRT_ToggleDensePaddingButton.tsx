import { type MouseEvent, useState } from 'react';
import Button, { type ButtonProps } from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { MRT_ToggleDensePaddingMenu } from '../menus/MRT_ToggleDensePaddingMenu';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_ToggleDensePaddingButtonProps<TData extends MRT_RowData>
  extends Omit<ButtonProps, 'children'> {
  table: MRT_TableInstance<TData>;
}

export const MRT_ToggleDensePaddingButton = <TData extends MRT_RowData>({
  table,
  ...rest
}: MRT_ToggleDensePaddingButtonProps<TData>) => {
  const {
    getState,
    options: {
      icons: { DensityLargeIcon, DensityMediumIcon, DensitySmallIcon },
      localization,
    },
  } = table;
  const { density } = getState();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const DensityIcon =
    density === 'compact'
      ? DensitySmallIcon
      : density === 'comfortable'
        ? DensityMediumIcon
        : DensityLargeIcon;

  return (
    <>
      <Tooltip title={rest?.title ?? localization.toggleDensity}>
        <Button
          aria-label={localization.toggleDensity}
          onClick={handleOpenMenu}
          size="small"
          startIcon={<DensityIcon fontSize="small" />}
          variant="text"
          {...rest}
          title={undefined}
        >
          {localization.toggleDensity}
        </Button>
      </Tooltip>
      {anchorEl && (
        <MRT_ToggleDensePaddingMenu
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          table={table}
        />
      )}
    </>
  );
};
