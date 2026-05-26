import {
  type MRT_ColumnDef,
  type MRT_FormFieldConfig,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

// A column form field enriched with config and layout metadata for rendering.
export interface MRT_FormFieldEntry<TData extends MRT_RowData> {
  columnId: string;
  columnDef: MRT_ColumnDef<TData>;
  // null when formField is a render function — config is only available for object-shaped formField.
  fieldConfig: MRT_FormFieldConfig<TData> | null;
  sectionId: string | undefined;
  order: number | undefined;
}

// ─── Sorting ──────────────────────────────────────────────────────────────────

// Returns a sorted copy of the items array.
// Items without an order value are placed at the end; otherwise ascending by order.
export const sortByOrder = <T extends { order?: number | undefined }>(
  items: T[],
): T[] =>
  [...items].sort((a, b) => {
    if (a.order === undefined && b.order === undefined) return 0;
    if (a.order === undefined) return 1;
    if (b.order === undefined) return -1;
    return a.order - b.order;
  });

// ─── Field Resolution ─────────────────────────────────────────────────────────

// Extracts and enriches form field entries from the table's leaf columns.
// Applies exclusion rules: display columns and formConfig.excludeColumns.
export const resolveFormFields = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
): MRT_FormFieldEntry<TData>[] => {
  const formConfig = table.options.formConfig;
  const excludedColumnIds = new Set(formConfig?.excludeColumns ?? []);

  return table
    .getAllLeafColumns()
    .filter((column) => {
      // Display columns (selection checkboxes, row-actions, etc.) are never shown in forms.
      if (column.columnDef.columnDefType === 'display') return false;
      // Columns listed in formConfig.excludeColumns are omitted from the form.
      if (excludedColumnIds.has(column.id)) return false;
      return true;
    })
    .map((column) => {
      const columnFormField = column.columnDef.formField ?? null;
      // formConfig.fields overrides the column-level formField — allows central configuration
      // when column definitions arrive from the backend without embedded formField config.
      const formConfigField = formConfig?.fields?.[column.id] ?? null;
      const fieldConfig = formConfigField
        ? { ...columnFormField, ...formConfigField }
        : columnFormField;

      return {
        columnId: column.id,
        columnDef: column.columnDef,
        fieldConfig,
        sectionId: fieldConfig?.section,
        order: fieldConfig?.order,
      };
    });
};

// Groups form fields by their sectionId, returning an id → entries map.
export const groupFieldsBySection = <TData extends MRT_RowData>(
  formFields: MRT_FormFieldEntry<TData>[],
): Record<string, MRT_FormFieldEntry<TData>[]> =>
  formFields.reduce<Record<string, MRT_FormFieldEntry<TData>[]>>(
    (acc, field) => {
      if (field.sectionId === undefined) return acc;
      const existingFields = acc[field.sectionId] ?? [];
      return { ...acc, [field.sectionId]: [...existingFields, field] };
    },
    {},
  );

// ─── Default Values ───────────────────────────────────────────────────────────

// Resolves a defaultValue that may be a static value or a zero-argument factory function.
const resolveDefaultValue = (defaultValue: unknown): unknown => {
  if (typeof defaultValue === 'function') {
    return (defaultValue as () => unknown)();
  }
  return defaultValue ?? '';
};

// Builds the RHF defaultValues map for all form fields.
// Edit mode: initialValues from modal state take full precedence over column defaults.
// Create mode: per-column and per-additional-field defaults are resolved.
export const buildDefaultValues = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  initialValues: Record<string, unknown> | undefined,
  mode: 'create' | 'edit',
): Record<string, unknown> => {
  if (mode === 'edit' && initialValues !== undefined) {
    return initialValues;
  }

  const formConfig = table.options.formConfig;
  const excludedColumnIds = new Set(formConfig?.excludeColumns ?? []);
  const values: Record<string, unknown> = {};

  for (const column of table.getAllLeafColumns()) {
    if (column.columnDef.columnDefType === 'display') continue;
    if (excludedColumnIds.has(column.id)) continue;

    const fieldConfig = column.columnDef.formField ?? null;

    values[column.id] = resolveDefaultValue(fieldConfig?.defaultValue);
  }

  for (const additionalField of formConfig?.additionalFields ?? []) {
    values[additionalField.name] = resolveDefaultValue(
      additionalField.defaultValue,
    );
  }

  return values;
};
