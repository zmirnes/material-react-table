import { type MouseEvent, useState } from 'react';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { MRT_TableOptionsMenu } from './MRT_TableOptionsMenu';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { getCommonTooltipProps } from '../../utils/style.utils';

interface MRT_TableOptionsButtonProps<TData extends MRT_RowData>
  extends IconButtonProps {
  table: MRT_TableInstance<TData>;
  tooltipTitle?: string;
  tableOptionsSx?: IconButtonProps['sx'];
}

export default function MRT_TableOptions<TData extends MRT_RowData>({
  table,
  tooltipTitle,
  tableOptionsSx,
  ...rest
}: MRT_TableOptionsButtonProps<TData>) {
  const {
    options: {
      icons: { MoreVertIcon },
      localization,
    },
  } = table;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const isMenuOpen = Boolean(anchorEl);

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const resolvedTooltipTitle = tooltipTitle || localization.tableOptions;

  return (
    <>
      <Tooltip {...getCommonTooltipProps('top')} title={resolvedTooltipTitle}>
        <IconButton
          aria-label={resolvedTooltipTitle}
          onClick={handleOpenMenu}
          size="small"
          {...rest}
          sx={[
            {
              '&:hover': {
                opacity: 1,
              },
              m: '-8px -4px',
              opacity: 0.7,
              transition: 'all 150ms',
              width: '1.5rem',
              height: '1.5rem',
            },
            ...(Array.isArray(tableOptionsSx)
              ? tableOptionsSx
              : [tableOptionsSx]),
          ]}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <MRT_TableOptionsMenu
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
        open={isMenuOpen}
        table={table}
      />
    </>
  );
}
