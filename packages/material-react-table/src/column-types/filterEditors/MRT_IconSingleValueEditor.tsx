import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Iconify from '../../components/iconify';
import { type MRT_AvailableIconOption } from '../../tanstack-table';
import {
  type MRT_FilterOperatorEditComponentProps,
  type MRT_IconsListEntry,
  type MRT_RowData,
} from '../../types';

export type MRT_IconSingleValueEditorProps<TData extends MRT_RowData> =
  MRT_FilterOperatorEditComponentProps<TData> & {
    // Selectable icon options fetched from backend via column.columnDef.meta.availableIcons
    availableIcons: MRT_AvailableIconOption[];
    // Iconify name + colour map supplied via column.iconsList
    iconsList: Record<string, MRT_IconsListEntry>;
  };

// Single-select filter editor for icon column type.
// Used by the 'equals' (Je) and 'notEquals' (Nije) operators.
// Stores the selected iconCode as a string in the filter rule value.
export const MRT_IconSingleValueEditor = <TData extends MRT_RowData>({
  availableIcons,
  column,
  iconsList,
  onChange,
  rule,
  table,
}: MRT_IconSingleValueEditorProps<TData>) => {
  // Render a localised fallback when no options are available (guard against misconfigured columns)
  if (!availableIcons.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        {table.options.localization.filterNoOptions}
      </Typography>
    );
  }

  // The filter rule stores the iconCode as a string (e.g. "6")
  const currentValue = typeof rule.value === 'string' ? rule.value : '';

  // Prefer the string column header as the Select label, fall back to column id
  const columnLabel =
    typeof column.columnDef.header === 'string'
      ? column.columnDef.header
      : column.id;

  // Renders the selected icon + tooltip inside the collapsed Select trigger
  const renderSelectedValue = (value: string) => {
    const option = availableIcons.find(
      (icon) => String(icon.iconType.iconCode) === value,
    );
    if (!option) return null;

    const iconDef = iconsList[String(option.iconType.iconCode)];

    return (
      <Stack direction="row" gap={1} alignItems="center">
        {iconDef && (
          <Iconify
            icon={iconDef.icon}
            sx={{ color: iconDef.defaultColor }}
            width={20}
          />
        )}
        <Typography variant="body2">{option.tooltip}</Typography>
      </Stack>
    );
  };

  return (
    <FormControl fullWidth size="small">
      {/* Prevent MUI from colouring the label with primary when the Select is focused/open */}
      <InputLabel
        shrink={!!currentValue}
        sx={{ '&.Mui-focused': { color: 'text.primary' } }}
      >
        {columnLabel}
      </InputLabel>
      <Select
        displayEmpty
        label={currentValue ? columnLabel : undefined}
        MenuProps={{ sx: { zIndex: 9999 } }}
        onChange={(event) =>
          onChange(event.target.value as Parameters<typeof onChange>[0])
        }
        renderValue={renderSelectedValue}
        size="small"
        sx={{ '& .MuiSelect-Select': { height: 'initial' } }}
        SelectDisplayProps={{
          style: { display: 'flex', alignItems: 'center' },
        }}
        value={currentValue}
      >
        {availableIcons.map((icon) => {
          const iconDef = iconsList[String(icon.iconType.iconCode)];
          return (
            <MenuItem
              key={String(icon.iconType.iconCode)}
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
              }}
              value={String(icon.iconType.iconCode)}
            >
              {iconDef && (
                <Iconify
                  icon={iconDef.icon}
                  sx={{ color: iconDef.defaultColor }}
                  width={20}
                />
              )}
              <Typography variant="body2">{icon.tooltip}</Typography>
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};
