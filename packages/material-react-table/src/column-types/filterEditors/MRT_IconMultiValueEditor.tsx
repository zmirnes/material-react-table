import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Iconify from '../../components/iconify';
import { type MRT_AvailableIconOption } from '../../tanstack-table';
import {
  type MRT_FilterOperatorEditComponentProps,
  type MRT_IconsListEntry,
  type MRT_RowData,
} from '../../types';

export type MRT_IconMultiValueEditorProps<TData extends MRT_RowData> =
  MRT_FilterOperatorEditComponentProps<TData> & {
    // Selectable icon options fetched from backend via column.columnDef.meta.availableIcons
    availableIcons: MRT_AvailableIconOption[];
    // Iconify name + colour map supplied via column.iconsList
    iconsList: Record<string, MRT_IconsListEntry>;
  };

// Multi-select filter editor for icon column type.
// Used by the 'inArray' (Je bilo koje od) operator.
// Stores the selected iconCodes as string[] in the filter rule value.
export const MRT_IconMultiValueEditor = <TData extends MRT_RowData>({
  availableIcons,
  column,
  iconsList,
  onChange,
  rule,
  table,
}: MRT_IconMultiValueEditorProps<TData>) => {
  // Render a localised fallback when no options are available (guard against misconfigured columns)
  if (!availableIcons.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        {table.options.localization.filterNoOptions}
      </Typography>
    );
  }

  // The filter rule stores selected iconCodes as string[] (e.g. ["6", "10"])
  const selectedValues = Array.isArray(rule.value)
    ? (rule.value as string[])
    : [];

  // Prefer the string column header as the Select label, fall back to column id
  const columnLabel =
    typeof column.columnDef.header === 'string'
      ? column.columnDef.header
      : column.id;

  // Renders the row of selected icons inside the collapsed multi-select trigger
  const renderSelectedValues = (values: string[]) => (
    <Stack direction="row" gap={0.5} flexWrap="wrap" alignItems="center">
      {values.map((iconCode) => {
        const option = availableIcons.find(
          (icon) => String(icon.iconType.iconCode) === iconCode,
        );
        if (!option) return null;

        const iconDef = iconsList[iconCode];
        if (!iconDef) return null;

        return (
          <Tooltip key={iconCode} title={option.tooltip}>
            <Iconify
              key={iconCode}
              icon={iconDef.icon}
              sx={{ color: iconDef.defaultColor }}
              width={20}
            />
          </Tooltip>
        );
      })}
    </Stack>
  );

  const handleChange = (event: { target: { value: string | string[] } }) => {
    const { value } = event.target;
    // MUI Select with multiple returns string when only one item is toggled via keyboard — normalise to array
    const normalizedValues =
      typeof value === 'string' ? value.split(',') : value;
    onChange(normalizedValues as Parameters<typeof onChange>[0]);
  };

  // Controls both the floating label and the notch in the outlined border.
  // MUI treats value=[] as "filled" ([] !== ''), which would cut the notch
  // even when nothing is selected — so we override both states explicitly.
  const hasValue = selectedValues.length > 0;

  return (
    <FormControl fullWidth size="small">
      {/* Prevent MUI from colouring the label with primary when the Select is focused/open */}
      <InputLabel
        shrink={hasValue}
        sx={{ '&.Mui-focused': { color: 'text.primary' } }}
      >
        {columnLabel}
      </InputLabel>
      <Select
        label={hasValue ? columnLabel : undefined}
        MenuProps={{ sx: { zIndex: 9999 } }}
        multiple
        onChange={handleChange}
        renderValue={renderSelectedValues}
        size="small"
        sx={{ '& .MuiSelect-Select': { height: 'initial' } }}
        SelectDisplayProps={{
          style: { display: 'flex', alignItems: 'center' },
        }}
        value={selectedValues}
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
