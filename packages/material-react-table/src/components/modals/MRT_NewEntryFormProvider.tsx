import { useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useMRT_SliceValue } from '../../hooks/useMRT_SliceValue';
import { MRT_NewEntryFormActionsContext } from './MRT_NewEntryFormActionsContext';
import { buildDefaultValues } from './MRT_NewEntryFormBuilder';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { RHF_FormProvider } from '../rhf-form/RHF_Form_Provider';

// ─── Provider Component ────────────────────────────────────────────────────────

export interface MRT_NewEntryFormProviderProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
  children: ReactNode;
}

// Sets up React Hook Form for the new entry / edit flow.
// Wraps children in RHF's FormProvider and exposes save/cancel handlers via context.
// Place this above any component that needs form state (fields body or actions footer).
export const MRT_NewEntryFormProvider = <TData extends MRT_RowData>({
  table,
  children,
}: MRT_NewEntryFormProviderProps<TData>) => {
  const {
    options: { formConfig },
    setNewEntryModal,
  } = table;
  const newEntryModal = useMRT_SliceValue(
    table._uiStore,
    (s) => s.newEntryModal,
  );

  // Default to 'create' when mode is not explicitly provided.
  const mode = newEntryModal.mode ?? 'create';

  const defaultValues = buildDefaultValues(
    table,
    newEntryModal.initialValues,
    mode,
  );

  const methods = useForm<Record<string, unknown>>({ defaultValues });

  // useForm's `defaultValues` is only read once, at first mount. The modal is
  // opened before the backend data arrives (newEntryModal.isLoading: true,
  // initialValues: undefined) and stays mounted through the whole loading ->
  // loaded transition, so once initialValues actually arrives it would
  // otherwise never reach the already-initialized form. Reset once loading
  // finishes to pick up the real values.
  useEffect(() => {
    if (!newEntryModal.isLoading) {
      methods.reset(defaultValues);
    }
    // Only re-run when the loading flag flips — defaultValues is recomputed
    // every render and must not itself retrigger this (that would wipe out
    // in-progress user edits on every keystroke-driven re-render).
  }, [newEntryModal.isLoading]);

  // Validates the form and calls the consumer's onSave on success.
  const handleSave = methods.handleSubmit(async () => {
    await formConfig?.onSave?.({ form: methods, mode, table });
  });

  // Notifies the consumer via onCancel then closes the modal.
  // onCancel may be async — modal closes only after the callback resolves.
  const handleCancel = async () => {
    await formConfig?.onCancel?.({ form: methods, mode, table });
    setNewEntryModal({ open: false });
  };

  return (
    <MRT_NewEntryFormActionsContext.Provider
      value={{ handleCancel, handleSave }}
    >
      <RHF_FormProvider methods={methods} onSubmit={handleSave}>
        {children}
      </RHF_FormProvider>
    </MRT_NewEntryFormActionsContext.Provider>
  );
};
