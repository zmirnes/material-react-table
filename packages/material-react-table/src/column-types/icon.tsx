import { Box, IconButton, Tooltip } from '@mui/material';
import { MouseEvent } from 'react';
import Iconify from '../components/iconify';
import { IIconColTypeValue } from '../tanstack-table';
import {
  ColumnTypeResolver,
  MRT_ColumnDef,
  MRT_FilterOperatorDefinition,
  MRT_FilterOperatorEditComponentProps,
  MRT_IconColumnDef,
  MRT_RowData,
} from '../types';
import { MRT_IconMultiValueEditor } from './filterEditors/MRT_IconMultiValueEditor';
import { MRT_IconSingleValueEditor } from './filterEditors/MRT_IconSingleValueEditor';

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
              cursor: 'pointer',
            }}
            onClick={handleClick}
          >
            <Tooltip title={value.description} disableInteractive>
              <Iconify icon={icon.icon} color="white" width={20} height={20} />
            </Tooltip>
            {Object.values(additional).map((add, index) => {
              const additionalIcon = iconsList[add.iconCode];
              if (!additionalIcon) return null;
              return (
                <Tooltip key={index} title={add.description} disableInteractive>
                  <Iconify icon={additionalIcon.icon} color="white" />
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
  getFilterOperators: <TData extends MRT_RowData, TValue = unknown>(
    column: MRT_ColumnDef<TData, TValue>,
  ): MRT_FilterOperatorDefinition<TData, TValue>[] => {
    // Available selectable icon options come from backend-provided column metadata
    const availableIcons = column.meta?.availableIcons ?? [];
    // Safe cast for iconsList — this resolver is only registered for icon columns in registy.ts
    const iconsList =
      (column as MRT_IconColumnDef<TData, TValue>).iconsList ?? {};

    // Without available options no meaningful filter can be built
    if (!availableIcons.length) {
      console.log('No available icons for filter operators:', column);
      return [];
    }

    // Single-select editor factory — used by 'equals' and 'notEquals'
    const createSingleSelectEditor = (
      props: MRT_FilterOperatorEditComponentProps<TData>,
    ) =>
      MRT_IconSingleValueEditor({
        ...props,
        availableIcons,
        iconsList,
      });

    // Multi-select editor factory — used by 'inArray'
    const createMultiSelectEditor = (
      props: MRT_FilterOperatorEditComponentProps<TData>,
    ) =>
      MRT_IconMultiValueEditor({
        ...props,
        availableIcons,
        iconsList,
      });

    return [
      {
        // 'Je' — selected iconCode must match the cell value exactly
        editComponent: createSingleSelectEditor,
        getInitialValue: () => '' as TValue,
        id: 'equals',
        isValueEmpty: (value: unknown) => value === '' || value == null,
        label: 'Equals',
      },
      {
        // 'Nije' — selected iconCode must not match the cell value
        editComponent: createSingleSelectEditor,
        getInitialValue: () => '' as TValue,
        id: 'notEquals',
        isValueEmpty: (value: unknown) => value === '' || value == null,
        label: 'Not Equals',
      },
      {
        // 'Je bilo koje od' — cell value must be one of the selected iconCodes
        editComponent: createMultiSelectEditor,
        getInitialValue: () => [] as unknown as TValue,
        id: 'inArray',
        // Empty when no iconCodes are selected
        isValueEmpty: (value: unknown) =>
          !Array.isArray(value) || value.length === 0,
        label: 'Is any of',
      },
    ] as MRT_FilterOperatorDefinition<TData, TValue>[];
  },
};
