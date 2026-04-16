import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import {
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../../types';

export type MRT_FreeMultiValueEditorProps<TData extends MRT_RowData> =
  MRT_FilterOperatorEditComponentProps<TData> & {
    // Controls whether typed values are transformed before being stored (e.g. to number)
    transformValues?: (rawValues: string[]) => unknown;
  };

// Free-text multi-value editor — lets the user type and tag arbitrary values.
// Used for 'inArray' on string and number columns, mirroring MUI's isAnyOf behaviour.
// The user presses Enter or comma to add each entry; the result is stored as an array.
export const MRT_FreeMultiValueEditor = <TData extends MRT_RowData>({
  onChange,
  rule,
  transformValues,
}: MRT_FreeMultiValueEditorProps<TData>) => {
  // Normalise stored value to string[] so the Autocomplete value is always controlled
  const displayValues = Array.isArray(rule.value) ? rule.value.map(String) : [];

  const handleChange = (_event: React.SyntheticEvent, newValues: string[]) => {
    // Optionally transform values (e.g. parse to numbers) before storing in filter state
    const valuesToStore = transformValues
      ? transformValues(newValues)
      : newValues;
    onChange(valuesToStore as Parameters<typeof onChange>[0]);
  };

  return (
    <Autocomplete
      freeSolo
      multiple
      // No predefined options — user types each value and confirms with Enter
      options={[]}
      value={displayValues}
      onChange={handleChange}
      size="small"
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const { key, ...chipProps } = getTagProps({ index });
          return <Chip key={key} label={option} size="small" {...chipProps} />;
        })
      }
      renderInput={(params) => (
        <TextField {...params} size="small" variant="outlined" />
      )}
    />
  );
};
