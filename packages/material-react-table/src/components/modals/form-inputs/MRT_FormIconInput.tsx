import { Controller, useFormContext } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MRT_IconStatusDot } from '../../../column-types/iconStatusDisplay';
import { type MRT_AvailableIconOption } from '../../../tanstack-table';
import {
  type MRT_ColumnDef,
  type MRT_FormFieldConfig,
  type MRT_IconsListEntry,
  type MRT_RowData,
} from '../../../types';
import Iconify from '../../iconify';

const DEFAULT_FIELD_SIZE = 'small';

export interface MRT_FormIconInputProps<TData extends MRT_RowData> {
  name: string;
  columnDef: MRT_ColumnDef<TData>;
  fieldConfig: MRT_FormFieldConfig<TData, string | null> | null;
  // Table-wide iconCode -> Iconify glyph map (table.options.iconsList)
  iconsList: Record<string, MRT_IconsListEntry>;
}

export const MRT_FormIconInput = <TData extends MRT_RowData>({
  name,
  columnDef,
  fieldConfig,
  iconsList,
}: MRT_FormIconInputProps<TData>) => {
  const { control } = useFormContext();

  // Available options provided via column metadata — list of selectable icons
  const availableIcons: MRT_AvailableIconOption[] =
    columnDef.meta?.availableIcons ?? [];

  // Prefer string headers for the Select label; fall back to accessorKey if header is a render function
  const label =
    fieldConfig?.label ??
    (typeof columnDef.header === 'string' ? columnDef.header : name);

  return (
    <Controller
      control={control}
      name={name}
      rules={fieldConfig?.rules}
      render={({ field, fieldState }) => {
        // The form stores the iconCode string — consistent with the filter editor value shape
        const currentValue = typeof field.value === 'string' ? field.value : '';

        const handleChange = (iconCode: string) => {
          const transformed = fieldConfig?.onChange?.(iconCode, name);
          // Use undefined check — null is a valid transformed value and must not be skipped
          field.onChange(transformed !== undefined ? transformed : iconCode);
        };

        // Renders the selected icon + tooltip inside the collapsed Select trigger
        const renderSelectedValue = (value: string) => {
          const option = availableIcons.find(
            (icon) => String(icon.iconType.iconCode) === value,
          );
          if (!option) return null;

          const iconDef = iconsList[value];

          return (
            <Stack alignItems="center" direction="row" gap={1}>
              {iconDef ? (
                <Iconify
                  icon={iconDef.component}
                  sx={{ color: iconDef.defaultColor ?? option.iconType.color }}
                  width={20}
                />
              ) : (
                <MRT_IconStatusDot color={option.iconType.color} />
              )}
              <Typography variant="body2">{option.tooltip}</Typography>
            </Stack>
          );
        };

        return (
          <FormControl
            disabled={fieldConfig?.disabled}
            error={!!fieldState.error}
            fullWidth
            size={fieldConfig?.size ?? DEFAULT_FIELD_SIZE}
          >
            <InputLabel sx={{ '&.Mui-focused': { color: 'text.primary' } }}>
              {label}
            </InputLabel>
            <Select
              label={label}
              MenuProps={{ sx: { zIndex: 1400 } }}
              onBlur={field.onBlur}
              onChange={(e) => handleChange(e.target.value as string)}
              renderValue={renderSelectedValue}
              value={currentValue}
            >
              {availableIcons.map((icon) => {
                const iconCode = String(icon.iconType.iconCode);
                const iconDef = iconsList[iconCode];

                return (
                  <MenuItem
                    key={iconCode}
                    sx={{ alignItems: 'center', display: 'flex', gap: 1 }}
                    value={iconCode}
                  >
                    {iconDef ? (
                      <Iconify
                        icon={iconDef.component}
                        sx={{
                          color: iconDef.defaultColor ?? icon.iconType.color,
                        }}
                        width={20}
                      />
                    ) : (
                      <MRT_IconStatusDot color={icon.iconType.color} />
                    )}
                    <Typography variant="body2">{icon.tooltip}</Typography>
                  </MenuItem>
                );
              })}
            </Select>
            {(fieldState.error?.message || fieldConfig?.helperText) && (
              <FormHelperText>
                {fieldState.error?.message ?? fieldConfig?.helperText}
              </FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
};
