import type React from 'react';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  groupFieldsBySection,
  resolveFormFields,
  sortByOrder,
} from './MRT_NewEntryFormBuilder';
import {
  type MRT_ColumnDef,
  type MRT_FormAdditionalField,
  type MRT_FormFieldConfig,
  type MRT_FormSectionConfig,
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

// Props for a single additional (non-column) field renderer.
interface AdditionalFieldControlProps<TData extends MRT_RowData> {
  additionalField: MRT_FormAdditionalField<TData>;
  table: MRT_TableInstance<TData>;
}

// Renders one additional field by delegating entirely to its required render function.
const AdditionalFieldControl = <TData extends MRT_RowData>({
  additionalField,
  table,
}: AdditionalFieldControlProps<TData>) => (
  <>{additionalField.render({ name: additionalField.name, table })}</>
);

// Props for a section block that wraps a group of related form fields.
interface FormSectionBlockProps {
  // The ExpandMore icon component sourced from the table's icon registry.
  expandMoreIcon: React.ElementType;
  sectionConfig: MRT_FormSectionConfig;
  children: React.ReactNode;
}

// Renders a section header, a divider, and its child fields inside an optional Collapse.
const FormSectionBlock = ({
  expandMoreIcon: ExpandIcon,
  sectionConfig,
  children,
}: FormSectionBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(!sectionConfig.defaultCollapsed);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <Stack>
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        onClick={sectionConfig.collapsible ? handleToggle : undefined}
        sx={{
          cursor: sectionConfig.collapsible ? 'pointer' : 'default',
          mb: 0.5,
        }}
      >
        <Typography fontWeight={600} variant="subtitle2">
          {sectionConfig.title}
        </Typography>
        {sectionConfig.collapsible && (
          <IconButton size="small">
            <ExpandIcon
              sx={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms',
              }}
            />
          </IconButton>
        )}
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Collapse in={isExpanded} unmountOnExit>
        <Stack gap={FORM_BODY_FIELD_GAP}>{children}</Stack>
      </Collapse>
    </Stack>
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
    options: {
      formConfig,
      icons: { ExpandMoreIcon },
    },
  } = table;

  const { newEntryModal } = getState();
  const mode = newEntryModal.mode ?? 'create';

  // Collect all eligible form fields from the table's leaf columns.
  const allFormFields = resolveFormFields(table);
  const additionalFields = formConfig?.additionalFields ?? [];

  // Sections sorted by their order value — lower numbers appear first.
  const sortedSections = sortByOrder(formConfig?.sections ?? []);

  // Fields without a section ID — rendered before the defined sections.
  const unsectionedFields = sortByOrder(
    allFormFields.filter(({ sectionId }) => sectionId === undefined),
  );

  // Map of sectionId → its fields for grouped section rendering.
  const fieldsBySection = groupFieldsBySection(allFormFields);

  // Additional fields sorted by order — rendered after all column fields.
  const sortedAdditionalFields = sortByOrder(additionalFields);

  // Consumer controls the entire form body when renderForm is provided.
  if (formConfig?.renderForm) {
    return <>{formConfig.renderForm({ form: methods, mode, table })}</>;
  }

  return (
    <Stack gap={FORM_BODY_FIELD_GAP}>
      {/* Unsectioned fields rendered before any defined sections */}
      {unsectionedFields.map(({ columnId, columnDef, fieldConfig }) => (
        <FormFieldControl
          columnDef={columnDef}
          columnId={columnId}
          fieldConfig={fieldConfig}
          key={columnId}
        />
      ))}

      {/* Sections with their grouped fields */}
      {sortedSections.map((sectionConfig) => {
        const sectionFields = sortByOrder(
          fieldsBySection[sectionConfig.id] ?? [],
        );
        return (
          <FormSectionBlock
            expandMoreIcon={ExpandMoreIcon}
            key={sectionConfig.id}
            sectionConfig={sectionConfig}
          >
            {sectionFields.map(({ columnId, columnDef, fieldConfig }) => (
              <FormFieldControl
                columnDef={columnDef}
                columnId={columnId}
                fieldConfig={fieldConfig}
                key={columnId}
              />
            ))}
          </FormSectionBlock>
        );
      })}

      {/* Additional non-column fields rendered after all column fields */}
      {sortedAdditionalFields.map((additionalField) => (
        <AdditionalFieldControl
          additionalField={additionalField}
          key={additionalField.name}
          table={table}
        />
      ))}
    </Stack>
  );
};
