import { type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { MRT_FormIconInput } from '../components/modals/form-inputs/MRT_FormIconInput';
import IconActiveFilterItem from './activeFiltersRenderers/IconActiveFilterItem';
import { MRT_IconMultiValueEditor } from './filterEditors/MRT_IconMultiValueEditor';
import { MRT_IconSingleValueEditor } from './filterEditors/MRT_IconSingleValueEditor';
import { MRT_IconStatusDot, resolveStatusColor } from './iconStatusDisplay';
import Iconify from '../components/iconify';
import { type IIconColTypeValue } from '../tanstack-table';
import {
  type MRT_FormFieldConfig,
  type MRT_FormFieldRenderProps,
  type ColumnTypeResolver,
  type MRT_ColumnDef,
  type MRT_FilterOperatorDefinition,
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../types';

export const IconColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => ({
    ...column,
    type: 'icon',
    Cell: ({ row, table, cell }) => {
      const value = cell.getValue<IIconColTypeValue>();
      if (!value) return null;

      // Without any configured icon options this column isn't set up for icons at
      // all — render nothing rather than a dot backed by no real definition.
      const availableIcons = column.meta?.availableIcons ?? [];
      if (!availableIcons.length) return null;

      // meta.availableIcons carries the tooltip text per iconCode; the cell
      // value's own `description` is used as a fallback when no match is found.
      const resolveTooltip = (iconCode: number, fallbackDescription: string) =>
        availableIcons.find((option) => option.iconType.iconCode === iconCode)
          ?.tooltip || fallbackDescription;

      // Table-wide iconCode -> Iconify glyph map (table.options.iconsList).
      // When a code isn't in it (or no map was supplied at all), fall back to
      // a colored dot instead of failing to render — meta.availableIcons
      // always has a color at least.
      const iconsList = table.options.iconsList ?? {};

      const renderStatus = (
        iconCode: number,
        color: string,
        forceWhite?: boolean,
      ) => {
        const iconDef = iconsList[String(iconCode)];
        if (iconDef) {
          return (
            <Iconify
              icon={iconDef.component}
              width={20}
              color={forceWhite ? 'white' : (iconDef.defaultColor ?? color)}
            />
          );
        }
        return <MRT_IconStatusDot color={forceWhite ? 'white' : color} />;
      };

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

      const cursor = column.onClickIconTypeColumn ? 'pointer' : 'default';
      const { additional } = value;

      // Compound status — pill container (background/rounded/padded) colored by
      // the primary status, holding one glyph (or dot fallback) per status.
      if (additional) {
        return (
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              alignItems: 'center',
              backgroundColor: (theme) =>
                resolveStatusColor(theme, value.color),
              borderRadius: 16,
              p: 0.5,
              cursor,
            }}
            onClick={handleClick}
          >
            <Tooltip
              title={resolveTooltip(value.iconCode, value.description)}
              disableInteractive
            >
              {renderStatus(value.iconCode, value.color, true)}
            </Tooltip>
            {Object.values(additional).map((add, index) => (
              <Tooltip
                key={index}
                title={resolveTooltip(add.iconCode, add.description)}
                disableInteractive
              >
                {renderStatus(add.iconCode, add.color, true)}
              </Tooltip>
            ))}
          </Box>
        );
      }

      return (
        <Tooltip
          title={resolveTooltip(value.iconCode, value.description)}
          disableInteractive
        >
          <IconButton disableRipple onClick={handleClick} sx={{ p: 0, cursor }}>
            {renderStatus(value.iconCode, value.color)}
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
        // Table-wide iconCode -> Iconify glyph map (table.options.iconsList)
        iconsList: props.table.options.iconsList ?? {},
      });

    // Multi-select editor factory — used by 'inArray'
    const createMultiSelectEditor = (
      props: MRT_FilterOperatorEditComponentProps<TData>,
    ) =>
      MRT_IconMultiValueEditor({
        ...props,
        availableIcons,
        iconsList: props.table.options.iconsList ?? {},
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
    table: MRT_TableInstance<TData>,
  ) => {
    // Cast TValue to string | null — icon fields store the selected iconCode string
    const fieldConfig =
      (column.formField as
        | MRT_FormFieldConfig<TData, string | null>
        | undefined) ?? null;
    // Table-wide iconCode -> Iconify glyph map (table.options.iconsList)
    const iconsList = table.options.iconsList ?? {};
    return ({ name, columnDef }: MRT_FormFieldRenderProps<TData>) => (
      <MRT_FormIconInput
        columnDef={columnDef}
        fieldConfig={fieldConfig}
        iconsList={iconsList}
        name={name}
      />
    );
  },
};
