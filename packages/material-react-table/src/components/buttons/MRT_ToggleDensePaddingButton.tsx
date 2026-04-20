import Button, { type ButtonProps } from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
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
    setDensity,
  } = table;
  const { density } = getState();

  const handleToggleDensePadding = () => {
    const nextDensity =
      density === 'comfortable'
        ? 'compact'
        : density === 'compact'
          ? 'spacious'
          : 'comfortable';
    setDensity(nextDensity);
  };

  const DensityIcon =
    density === 'compact'
      ? DensitySmallIcon
      : density === 'comfortable'
        ? DensityMediumIcon
        : DensityLargeIcon;

  return (
    <Tooltip title={rest?.title ?? localization.toggleDensity}>
      <Button
        aria-label={localization.toggleDensity}
        onClick={handleToggleDensePadding}
        size="small"
        startIcon={<DensityIcon fontSize="small" />}
        variant="text"
        {...rest}
        title={undefined}
      >
        {localization.toggleDensity}
      </Button>
    </Tooltip>
  );
};
