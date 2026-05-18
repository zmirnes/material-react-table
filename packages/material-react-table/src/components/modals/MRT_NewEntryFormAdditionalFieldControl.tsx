import {
  type MRT_FormAdditionalField,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';

// Props for a single additional (non-column) field renderer.
export interface MRT_NewEntryFormAdditionalFieldControlProps<
  TData extends MRT_RowData,
> {
  additionalField: MRT_FormAdditionalField<TData>;
  table: MRT_TableInstance<TData>;
}

// Renders one additional field by delegating entirely to its required render function.
export const MRT_NewEntryFormAdditionalFieldControl = <
  TData extends MRT_RowData,
>({
  additionalField,
  table,
}: MRT_NewEntryFormAdditionalFieldControlProps<TData>) => (
  <>{additionalField.render({ name: additionalField.name, table })}</>
);
