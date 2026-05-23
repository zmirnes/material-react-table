import SyncIcon from '@mui/icons-material/Sync';
import SyncDisabledIcon from '@mui/icons-material/SyncDisabled';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import {
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../../types';

// Shape of the dimension filter value stored in the filter rule.
// Each dimension field name (e.g. 'width', 'height') maps to a numeric value.
// 'tolerance' is an optional dedicated tolerance field.
// 'rotation' is an optional toggle: 0 = off, 1 = on.
export type DimensionFilterValue = Record<string, number | undefined> & {
  rotation?: 0 | 1;
};

// Computes MUI outline border styles for a "grouped" (connected) input sequence.
// Removes shared inner borders and rounds only the outer-most corners.
const getGroupedInputBorderStyle = (index: number, total: number) => {
  // Single input — no adjustments needed
  if (total === 1) return {};

  if (index === 0) {
    // First input: remove right-side rounding so it connects flush to the next input
    return { borderTopRightRadius: 0, borderBottomRightRadius: 0 };
  }

  if (index === total - 1) {
    // Last input: remove left-side rounding and shared border to avoid double border
    return {
      borderBottomLeftRadius: 0,
      borderLeft: 'none',
      borderTopLeftRadius: 0,
    };
  }

  // Middle inputs: fully square corners, no left border
  return { borderLeft: 'none', borderRadius: 0 };
};

// Dimension filter editor — renders a row of grouped number inputs (one per dimension
// field) plus an optional tolerance input and a rotation toggle button.
// The layout mirrors the GroupedInputs component from frontend-dev.
export const MRT_DimensionFilterEditor = <TData extends MRT_RowData>({
  column,
  onChange,
  rule,
  table,
}: MRT_FilterOperatorEditComponentProps<TData>) => {
  const dimensions = column.columnDef.meta?.dimensions;

  // If we don't have the necessary dimension config, we can't render the editor — return null to avoid errors
  if (!dimensions?.fields?.length) return null;

  // Build the ordered list of input keys: dimension fields + optional 'tolerance' field
  const inputKeys = dimensions.fields;

  // Current filter value — defaults to empty object when not yet set
  const currentValue = (rule.value as DimensionFilterValue) || {};

  // Update a single field inside the filter value object
  const handleFieldChange = (fieldKey: string, rawInput: string) => {
    // Enforce tolerance upper bound — discard input that exceeds max
    if (
      fieldKey === 'tolerance' &&
      dimensions?.tolerance &&
      Number(rawInput) > dimensions.tolerance.max
    ) {
      return;
    }

    const parsedNumber = rawInput === '' ? undefined : Number(rawInput);

    onChange({
      ...currentValue,
      [fieldKey]: parsedNumber,
    } as Parameters<typeof onChange>[0]);
  };

  // Toggle rotation between 0 (disabled) and 1 (enabled)
  const handleToggleRotation = () => {
    onChange({
      ...currentValue,
      rotation: currentValue.rotation ? 0 : 1,
    } as Parameters<typeof onChange>[0]);
  };

  const isRotationEnabled = currentValue.rotation === 1;

  // Resolve localized rotation tooltip labels from the table localization config
  const rotationTooltip = isRotationEnabled
    ? table.options.localization.dimensionRotationEnabled
    : table.options.localization.dimensionRotationDisabled;

  return (
    <Stack alignItems="center" direction="row" gap={1}>
      {/* Grouped connected number inputs — one per dimension field + optional tolerance */}
      <Stack direction="row">
        {inputKeys.map((fieldKey, index) => (
          <TextField
            key={fieldKey}
            label={fieldKey}
            fullWidth
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            size="small"
            // Apply tolerance limits when the input represents the tolerance field
            slotProps={
              fieldKey === 'tolerance' && dimensions?.tolerance
                ? {
                    htmlInput: {
                      max: dimensions.tolerance.max,
                      min: dimensions.tolerance.min,
                    },
                  }
                : undefined
            }
            sx={{
              // Apply grouped border styles — only outer corners are rounded
              '& .MuiOutlinedInput-notchedOutline': getGroupedInputBorderStyle(
                index,
                inputKeys.length,
              ),
              // Suppress focused border emphasis to maintain the seamless grouped look
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(145, 158, 171, 0.8)',
                borderWidth: '1px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(145, 158, 171, 0.8)',
                borderWidth: '1px',
              },
            }}
            type="number"
            value={currentValue[fieldKey] ?? ''}
          />
        ))}
      </Stack>

      {/* Rotation toggle button — SyncIcon when enabled, SyncDisabledIcon when off */}
      <Tooltip title={rotationTooltip}>
        <IconButton onClick={handleToggleRotation} size="small">
          {isRotationEnabled ? <SyncIcon /> : <SyncDisabledIcon />}
        </IconButton>
      </Tooltip>
    </Stack>
  );
};
