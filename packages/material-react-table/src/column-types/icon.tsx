import { Box, IconButton, Tooltip } from '@mui/material';
import { MouseEvent } from 'react';
import Iconify from '../components/iconify';
import { IIconColTypeValue } from '../tanstack-table';
import { ColumnTypeResolver } from '../types';

export const IconColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => ({
    ...column,
    type: 'icon',
    Cell: ({ row, table, cell }) => {
      const value = cell.getValue<IIconColTypeValue>();
      const iconsList = column.iconsList || {};
      if (!iconsList[value.iconCode]) return null;
      const icon = iconsList[value.iconCode];
      const { additional } = value;

      const handleClick = (event: MouseEvent<HTMLElement>) => {
        if (column.onClickIconTypeColumn) {
          column.onClickIconTypeColumn({
            row,
            table,
            value,
            anchorEl: event.currentTarget,
          });
        }
      };

      if (additional) {
        return (
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              alignItems: 'center',
              backgroundColor: icon.defaultColor,
              borderRadius: 16,
              p: 0.5,
            }}
            onClick={handleClick}
          >
            <Tooltip title={value.description} disableInteractive>
              <IconButton size="small" disableRipple sx={{ p: 0 }}>
                <Iconify
                  icon={icon.icon}
                  color="white"
                  width={20}
                  height={20}
                />
              </IconButton>
            </Tooltip>
            {Object.values(additional).map((add, index) => {
              const additionalIcon = iconsList[add.iconCode];
              if (!additionalIcon) return null;
              return (
                <Tooltip key={index} title={add.description} disableInteractive>
                  <IconButton size="small" disableRipple sx={{ p: 0 }}>
                    <Iconify icon={additionalIcon.icon} color="white" />
                  </IconButton>
                </Tooltip>
              );
            })}
          </Box>
        );
      }

      return (
        <Tooltip title={value.description} disableInteractive>
          <IconButton size="small" disableRipple sx={{ p: 0 }}>
            <Iconify icon={icon.icon} color={icon.defaultColor} />
          </IconButton>
        </Tooltip>
      );
    },
  }),
  getFilterOperators: () => [],
};
