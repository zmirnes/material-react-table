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
import { MRT_IconStatusDot } from '../iconStatusDisplay';

export type MRT_IconMultiValueEditorProps<TData extends MRT_RowData> =
  MRT_FilterOperatorEditComponentProps<TData> & {
    // Selectable icon options fetched from backend via column.columnDef.meta.availableIcons
    availableIcons: MRT_AvailableIconOption[];
    // Consumer-supplied iconCode -> Iconify glyph map, from column.iconsList
    iconsList: Record<string, MRT_IconsListEntry>;
  };

// Renders the real Iconify glyph when the consumer supplied one for this
// iconCode, otherwise falls back to a colored dot using the option's color.
const renderIconOption = (
  option: MRT_AvailableIconOption,
  iconsList: Record<string, MRT_IconsListEntry>,
) => {
  const iconDef = iconsList[String(option.iconType.iconCode)];
  return iconDef ? (
    <Iconify
      icon={iconDef.component}
      sx={{ color: iconDef.defaultColor ?? option.iconType.color }}
      width={20}
    />
  ) : (
    <MRT_IconStatusDot color={option.iconType.color} />
  );
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

  // Unique per rule so multiple filter rows never collide, and the label is
  // properly associated with its field (fixes "no label associated"/"missing id" a11y errors).
  const inputId = `mrt-icon-filter-${rule.id}`;
  const labelId = `${inputId}-label`;

  // Renders the row of selected icons inside the collapsed multi-select trigger
  const renderSelectedValues = (values: string[]) => (
    <Stack direction="row" gap={0.5} flexWrap="wrap" alignItems="center">
      {values.map((iconCode) => {
        const option = availableIcons.find(
          (icon) => String(icon.iconType.iconCode) === iconCode,
        );
        if (!option) return null;

        return (
          <Tooltip key={iconCode} title={option.tooltip}>
            {renderIconOption(option, iconsList)}
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

  return (
    <FormControl fullWidth size="small">
      {/* `label` must always be passed to Select (not conditionally) so MUI can correctly
          size the notch cut into the outlined border. */}
      <InputLabel htmlFor={inputId} id={labelId}>
        {columnLabel}
      </InputLabel>
      <Select
        id={inputId}
        label={columnLabel}
        labelId={labelId}
        MenuProps={{ sx: { zIndex: 9999 } }}
        multiple
        name={inputId}
        onChange={handleChange}
        renderValue={renderSelectedValues}
        size="small"
        value={selectedValues}
      >
        {availableIcons.map((icon) => (
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
            {renderIconOption(icon, iconsList)}
            <Typography variant="body2">{icon.tooltip}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
