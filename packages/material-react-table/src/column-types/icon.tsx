import { type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { MRT_FormIconInput } from '../components/modals/form-inputs/MRT_FormIconInput';
import IconActiveFilterItem from './activeFiltersRenderers/IconActiveFilterItem';
import { MRT_IconMultiValueEditor } from './filterEditors/MRT_IconMultiValueEditor';
import { MRT_IconSingleValueEditor } from './filterEditors/MRT_IconSingleValueEditor';
import Iconify from '../components/iconify';
import { type IIconColTypeValue } from '../tanstack-table';
import {
  type MRT_FormFieldConfig,
  type MRT_FormFieldRenderProps,
  type ColumnTypeResolver,
  type MRT_ColumnDef,
  type MRT_FilterOperatorDefinition,
  type MRT_FilterOperatorEditComponentProps,
  type MRT_IconColumnDef,
  type MRT_RowData,
} from '../types';

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
      return [];
    }

    // Single-select editor factory — used by 'is' and 'not'
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
        id: 'is',
        isValueEmpty: (value: unknown) => value === '' || value == null,
        label: 'Is',
        valueShape: 'single',
      },
      {
        // 'Nije' — selected iconCode must not match the cell value
        editComponent: createSingleSelectEditor,
        getInitialValue: () => '' as TValue,
        id: 'not',
        isValueEmpty: (value: unknown) => value === '' || value == null,
        label: 'Not',
        valueShape: 'single',
      },
      {
        // 'Je bilo koje od' — cell value must be one of the selected iconCodes
        editComponent: createMultiSelectEditor,
        getInitialValue: () => [] as unknown as TValue,
        id: 'isAnyOf',
        // Empty when no iconCodes are selected
        isValueEmpty: (value: unknown) =>
          !Array.isArray(value) || value.length === 0,
        label: 'Is any of',
        valueShape: 'multi',
      },
    ] as MRT_FilterOperatorDefinition<TData, TValue>[];
  },
  activeFilterRenderer: IconActiveFilterItem,
  getFormFieldRenderer: <TData extends MRT_RowData>(
    column: MRT_ColumnDef<TData>,
  ) => {
    // Cast TValue to string | null — icon fields store the selected iconCode string
    const fieldConfig =
      (column.formField as
        | MRT_FormFieldConfig<TData, string | null>
        | undefined) ?? null;
    return ({ name, columnDef }: MRT_FormFieldRenderProps<TData>) => (
      <MRT_FormIconInput
        columnDef={columnDef}
        fieldConfig={fieldConfig}
        name={name}
      />
    );
  },
};
