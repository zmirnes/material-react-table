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
import { MRT_IconStatusDot } from '../iconStatusDisplay';

export type MRT_IconSingleValueEditorProps<TData extends MRT_RowData> =
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

// Single-select filter editor for icon column type.
// Used by the 'is' (Je) and 'not' (Nije) operators.
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

  // Unique per rule so multiple filter rows never collide, and the label is
  // properly associated with its field (fixes "no label associated"/"missing id" a11y errors).
  const inputId = `mrt-icon-filter-${rule.id}`;
  const labelId = `${inputId}-label`;

  // Renders the selected icon + tooltip inside the collapsed Select trigger
  const renderSelectedValue = (value: string) => {
    const option = availableIcons.find(
      (icon) => String(icon.iconType.iconCode) === value,
    );
    if (!option) return null;

    return (
      <Stack direction="row" gap={1} alignItems="center">
        {renderIconOption(option, iconsList)}
        <Typography variant="body2">{option.tooltip}</Typography>
      </Stack>
    );
  };

  return (
    <FormControl fullWidth size="small">
      {/* `label` must always be passed to Select (not conditionally) so MUI can correctly
          size the notch cut into the outlined border. */}
      <InputLabel
        htmlFor={inputId}
        id={labelId}
        sx={{ '&.Mui-focused': { color: 'text.primary' } }}
      >
        {columnLabel}
      </InputLabel>
      <Select
        displayEmpty
        id={inputId}
        label={columnLabel}
        labelId={labelId}
        MenuProps={{ sx: { zIndex: 9999 } }}
        name={inputId}
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
