import { useFormContext } from 'react-hook-form';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useMRT_NewEntryFormActions } from './MRT_NewEntryFormActionsContext';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_NewEntryFormActionsProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
}

// Renders the Save/Cancel buttons and any consumer-defined custom actions in the modal footer.
// Must be placed inside MRT_NewEntryFormProvider — reads RHF context and action handlers from it.
export const MRT_NewEntryFormActions = <TData extends MRT_RowData>({
  table,
}: MRT_NewEntryFormActionsProps<TData>) => {
  const methods = useFormContext();
  const { handleCancel } = useMRT_NewEntryFormActions();

  const {
    getState,
    options: { formConfig, localization, muiNewEntryModalProps },
  } = table;

  const { newEntryModal } = getState();
  const mode = newEntryModal.mode ?? 'create';

  const resolvedModalProps = muiNewEntryModalProps ?? {};
  const { footerProps, footerSx } = resolvedModalProps;

  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      {...footerProps}
      sx={{ gap: 1, pt: 1, px: 2, ...footerSx }}
    >
      {/* Consumer-defined custom action buttons rendered before the default Save/Cancel pair */}
      {formConfig?.customActions?.map((customAction) => (
        <span key={customAction.key}>
          {customAction.render({ form: methods, mode, table })}
        </span>
      ))}
      <Button onClick={handleCancel} variant="outlined">
        {localization.cancel}
      </Button>
      <Button type="submit" variant="contained">
        {localization.save}
      </Button>
    </Stack>
  );
};
