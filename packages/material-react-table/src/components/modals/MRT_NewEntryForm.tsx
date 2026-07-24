import { Controller, useFormContext } from 'react-hook-form';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useMRT_SliceValue } from '../../hooks/useMRT_SliceValue';
import { MRT_NewEntryFormAdditionalFieldControl } from './MRT_NewEntryFormAdditionalFieldControl';
import {
  groupFieldsBySection,
  resolveFormFields,
  sortByOrder,
  toAdditionalRenderEntries,
  toColumnRenderEntries,
} from './MRT_NewEntryFormBuilder';
import { MRT_NewEntryFormSectionBlock } from './MRT_NewEntryFormSectionBlock';
import { MRT_NewEntryFormSkeleton } from './MRT_NewEntryFormSkeleton';
import { columnTypeResolvers } from '../../column-types/registy';
import {
  type MRT_ColumnDef,
  type MRT_FormFieldConfig,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';

// Default MUI TextField size applied when no per-field size is specified.
const DEFAULT_FIELD_SIZE = 'small';

// Renders one column-backed form field using the best available renderer:
// 1. formField render function (full control, column-level)
// 2. fieldConfig.render (render override inside a config object)
// 3. Column type resolver — type-specific input component
// 4. Fallback controlled MUI TextField for unresolved column types
interface FormFieldControlProps<TData extends MRT_RowData> {
  columnId: string;
  columnDef: MRT_ColumnDef<TData>;
  fieldConfig: MRT_FormFieldConfig<TData> | null;
  // Required for passing to the column type resolver — some resolvers need table state.
  table: MRT_TableInstance<TData>;
}

const FormFieldControl = <TData extends MRT_RowData>({
  columnId,
  columnDef,
  fieldConfig,
  table,
}: FormFieldControlProps<TData>) => {
  const { control } = useFormContext();

  // formField config has an explicit render override — delegate to it.
  if (fieldConfig?.render) {
    return <>{fieldConfig.render({ columnDef, name: columnId })}</>;
  }

  if (columnDef.type === 'actions' || columnDef.type === 'object') {
    return null;
  }

  const resolver = columnTypeResolvers[columnDef.type];
  const typeRenderer = resolver?.getFormFieldRenderer?.(columnDef, table);
  if (typeRenderer) {
    return <>{typeRenderer({ columnDef, name: columnId })}</>;
  }

  // Fallback: render a controlled MUI TextField for unresolved column types.
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
            const transformed = fieldConfig?.onChange?.(
              e.target.value,
              columnId,
            );
            field.onChange(transformed ?? e.target.value);
          }}
        />
      )}
    />
  );
};

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
    options: {
      formConfig,
      icons: { ExpandMoreIcon },
    },
  } = table;

  const newEntryModal = useMRT_SliceValue(
    table._uiStore,
    (s) => s.newEntryModal,
  );
  const mode = newEntryModal.mode ?? 'create';

  // Consumer controls the entire form body — skip all field calculations.
  if (formConfig?.renderForm) {
    return <>{formConfig.renderForm({ form: methods, mode, table })}</>;
  }

  // Data is still loading from the backend — show skeleton placeholders.
  if (newEntryModal.isLoading) {
    return <MRT_NewEntryFormSkeleton table={table} />;
  }

  // Collect all eligible form fields from the table's leaf columns.
  const allFormFields = resolveFormFields(table);
  const additionalFields = formConfig?.additionalFields ?? [];

  // Merge column fields and additional fields into one list so they can be sorted and
  // grouped together by their shared order/section — an additionalField's order is
  // otherwise only ever compared against other additional fields, never column fields.
  const allEntries = [
    ...toColumnRenderEntries(allFormFields),
    ...toAdditionalRenderEntries(additionalFields),
  ];

  // Sections sorted by their order value — lower numbers appear first.
  const sortedSections = sortByOrder(formConfig?.sections ?? []);

  // Entries without a section assignment — rendered after all sections.
  const unsectionedEntries = sortByOrder(
    allEntries.filter(({ sectionId }) => sectionId === undefined),
  );

  // Map of sectionId → its entries, used when rendering each section block.
  const entriesBySection = groupFieldsBySection(allEntries);

  return (
    <Stack gap={2}>
      {/* Defined sections — each section groups its assigned fields under a collapsible heading */}
      {sortedSections.map((sectionConfig) => {
        const sectionEntries = sortByOrder(
          entriesBySection[sectionConfig.id] ?? [],
        );
        return (
          <MRT_NewEntryFormSectionBlock
            expandMoreIcon={ExpandMoreIcon}
            key={sectionConfig.id}
            sectionConfig={sectionConfig}
          >
            {sectionEntries.map((entry) =>
              entry.kind === 'column' ? (
                <FormFieldControl
                  columnDef={entry.columnDef}
                  columnId={entry.columnId}
                  fieldConfig={entry.fieldConfig}
                  key={entry.columnId}
                  table={table}
                />
              ) : (
                <MRT_NewEntryFormAdditionalFieldControl
                  additionalField={entry.additionalField}
                  key={entry.additionalField.name}
                  table={table}
                />
              ),
            )}
          </MRT_NewEntryFormSectionBlock>
        );
      })}

      {/* Entries with no section assignment — grid when formConfig.columns is set, Stack otherwise */}
      {unsectionedEntries.length > 0 && (
        <Stack
          gap={2}
          sx={
            formConfig?.columns
              ? {
                  display: 'grid',
                  gridTemplateColumns: `repeat(${formConfig.columns}, 1fr)`,
                }
              : undefined
          }
        >
          {unsectionedEntries.map((entry) =>
            entry.kind === 'column' ? (
              <FormFieldControl
                columnDef={entry.columnDef}
                columnId={entry.columnId}
                fieldConfig={entry.fieldConfig}
                key={entry.columnId}
                table={table}
              />
            ) : (
              <MRT_NewEntryFormAdditionalFieldControl
                additionalField={entry.additionalField}
                key={entry.additionalField.name}
                table={table}
              />
            ),
          )}
        </Stack>
      )}
    </Stack>
  );
};
