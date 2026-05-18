import { Controller, useFormContext } from 'react-hook-form';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { MRT_NewEntryFormAdditionalFieldControl } from './MRT_NewEntryFormAdditionalFieldControl';
import { resolveFormFields, sortByOrder } from './MRT_NewEntryFormBuilder';
import {
  type MRT_ColumnDef,
  type MRT_FormFieldConfig,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

// Default MUI TextField size applied when no per-field size is specified.
const DEFAULT_FIELD_SIZE = 'small' as const;

// Gap (in MUI spacing units) between adjacent fields in the form body.
const FORM_BODY_FIELD_GAP = 2;

// Props for a single column-backed form field renderer.
interface FormFieldControlProps<TData extends MRT_RowData> {
  columnId: string;
  columnDef: MRT_ColumnDef<TData>;
  // null when formField is a render function; only populated for object-shaped formField.
  fieldConfig: MRT_FormFieldConfig<TData> | null;
}

// Renders one column-backed form field using the best available renderer:
// 1. formField render function (full control, column-level)
// 2. fieldConfig.render (render override inside a config object)
// 3. Default controlled MUI TextField
const FormFieldControl = <TData extends MRT_RowData>({
  columnId,
  columnDef,
  fieldConfig,
}: FormFieldControlProps<TData>) => {
  const { control } = useFormContext();
  const rawFormField = columnDef.formField;

  // formField is a function — the consumer owns the full field rendering.
  if (typeof rawFormField === 'function') {
    return <>{rawFormField({ columnDef, name: columnId })}</>;
  }

  // formField config has an explicit render override — delegate to it.
  if (fieldConfig?.render) {
    return <>{fieldConfig.render({ columnDef, name: columnId })}</>;
  }

  // Fallback: render a controlled MUI TextField with optional RHF validation rules.
  return (
    <Controller
      control={control}
      name={columnId}
      rules={fieldConfig?.rules}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          error={!!fieldState.error}
          fullWidth
          disabled={fieldConfig?.disabled}
          helperText={fieldState.error?.message ?? fieldConfig?.helperText}
          label={fieldConfig?.label ?? columnDef.header}
          placeholder={fieldConfig?.placeholder}
          size={DEFAULT_FIELD_SIZE}
          onChange={(e) => {
            const rawValue = e.target.value;
            // Allow the consumer to intercept and transform the incoming value.
            const transformed = fieldConfig?.onChange?.(
              rawValue as never,
              columnId,
            );
            field.onChange(transformed !== undefined ? transformed : rawValue);
          }}
        />
      )}
    />
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

export interface MRT_NewEntryFormProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
}

// Renders the scrollable form body inside MRT_NewEntryModal.
// Must be placed inside MRT_NewEntryFormProvider — reads RHF context via useFormContext().
// Fields are auto-generated from the table's leaf columns according to their formField config.
export const MRT_NewEntryForm = <TData extends MRT_RowData>({
  table,
}: MRT_NewEntryFormProps<TData>) => {
  const methods = useFormContext();

  const {
    getState,
    options: { formConfig },
  } = table;

  const { newEntryModal } = getState();
  const mode = newEntryModal.mode ?? 'create';

  // Consumer controls the entire form body — skip all field calculations.
  if (formConfig?.renderForm) {
    return <>{formConfig.renderForm({ form: methods, mode, table })}</>;
  }

  // Collect all eligible form fields from the table's leaf columns sorted by order.
  const sortedFormFields = sortByOrder(resolveFormFields(table));
  const additionalFields = formConfig?.additionalFields ?? [];

  // Additional fields sorted by order — rendered after all column fields.
  const sortedAdditionalFields = sortByOrder(additionalFields);

  return (
    <Stack gap={FORM_BODY_FIELD_GAP}>
      {/* Column-backed fields sorted by their order value */}
      {sortedFormFields.map(({ columnId, columnDef, fieldConfig }) => (
        <FormFieldControl
          columnDef={columnDef}
          columnId={columnId}
          fieldConfig={fieldConfig}
          key={columnId}
        />
      ))}

      {/* Additional non-column fields rendered after all column fields */}
      {sortedAdditionalFields.map((additionalField) => (
        <MRT_NewEntryFormAdditionalFieldControl
          additionalField={additionalField}
          key={additionalField.name}
          table={table}
        />
      ))}
    </Stack>
  );
};
