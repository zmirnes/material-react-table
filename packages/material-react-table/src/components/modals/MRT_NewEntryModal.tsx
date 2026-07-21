import React from 'react';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useMRT_SliceValue } from '../../hooks/useMRT_SliceValue';
import { MRT_NewEntryForm } from './MRT_NewEntryForm';
import { MRT_NewEntryFormActions } from './MRT_NewEntryFormActions';
import { MRT_NewEntryFormProvider } from './MRT_NewEntryFormProvider';
import {
  type MRT_ModalPosition,
  type MRT_NewEntryModalOverrides,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';

// Maps TModalPosition.vertical to a CSS alignItems value.
const resolveVerticalAlign = (position?: MRT_ModalPosition): string => {
  if (!position) return 'flex-start';
  const map: Record<MRT_ModalPosition['vertical'], string> = {
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end',
  };
  return map[position.vertical];
};

// Maps TModalPosition.horizontal to a CSS justifyContent value.
const resolveHorizontalAlign = (position?: MRT_ModalPosition): string => {
  if (!position) return 'center';
  const map: Record<MRT_ModalPosition['horizontal'], string> = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };
  return map[position.horizontal];
};

// Clamps a percentage offset to [-100, 100], defaulting to the provided fallback.
const clampOffset = (value: number | undefined, fallback: number): number => {
  if (value === undefined) return fallback;
  return Math.max(-100, Math.min(100, value));
};

// Props for the MRT_NewEntryModal component.
// Extends MRT_NewEntryModalOverrides so all style/override props can also be
// passed directly on the element (e.g. when rendered by MRT_TableContainer).
export interface MRT_NewEntryModalProps<TData extends MRT_RowData>
  extends MRT_NewEntryModalOverrides {
  table: MRT_TableInstance<TData>;
}

export const MRT_NewEntryModal = <TData extends MRT_RowData>({
  table,
}: MRT_NewEntryModalProps<TData>) => {
  const theme = useTheme();

  const {
    options: {
      formConfig,
      icons: { CancelIcon },
      localization,
      muiNewEntryModalProps,
    },
    setNewEntryModal,
  } = table;

  // Resolve muiNewEntryModalProps — plain object, defaults to empty object.
  const resolvedModalProps = muiNewEntryModalProps ?? {};

  const {
    title: titleOverride,
    contentContainerSx,
    headerSx,
    headerProps,
    bodySx,
    bodyProps,
    modalSx,
    modalProps,
    closeButtonProps,
    disableHeader,
    position,
    headerComponents,
  } = resolvedModalProps;

  const newEntryModal = useMRT_SliceValue(
    table._uiStore,
    (s) => s.newEntryModal,
  );

  // Whether the modal was opened in edit mode — determines the title.
  const isEditMode = newEntryModal.mode === 'edit';

  const handleClose = () => {
    setNewEntryModal({ open: false });
  };

  // If the consumer provides renderModal, delegate the entire overlay to them.
  // No Modal wrapper is rendered — the consumer owns the full overlay lifecycle.
  if (formConfig?.renderModal) {
    return <>{formConfig.renderModal({ table })}</>;
  }

  // Resolved modal title — consumer override takes priority over localization.
  const resolvedTitle =
    titleOverride ?? (isEditMode ? localization.edit : localization.newEntry);

  // Resolved vertical and horizontal offset percentages.
  const verticalOffset = clampOffset(position?.verticalOffset, 10);
  const horizontalOffset = clampOffset(position?.horizontalOffset, 0);

  return (
    <Modal
      disableAutoFocus
      onClose={handleClose}
      open={newEntryModal.open}
      {...modalProps}
      sx={{
        alignItems: resolveVerticalAlign(position),
        display: 'flex',
        justifyContent: resolveHorizontalAlign(position),
        maxHeight: '90%',
        zIndex: 1300,
        ...modalSx,
      }}
    >
      <Stack
        sx={{
          background: theme.palette.background.paper,
          borderRadius: 1,
          height: 'min-content',
          maxHeight: '90vh',
          maxWidth: '90%',
          minWidth: 400,
          overflow: 'hidden',
          position: 'relative',
          py: 1,
          top: `${verticalOffset}%`,
          left: `${horizontalOffset}%`,
          transition: '300ms',
          willChange: 'transform',
          ...contentContainerSx,
        }}
      >
        {/* Header is hidden when disableHeader is true */}
        {!disableHeader && (
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            {...headerProps}
            sx={{ flexShrink: 0, px: 1, width: '100%', ...headerSx }}
          >
            <Typography variant="h6">{resolvedTitle}</Typography>
            {/* Custom header components rendered between title and close button */}
            {headerComponents}
            <IconButton
              aria-label={localization.close}
              color="error"
              {...closeButtonProps}
              onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                // Run consumer's onClick first.
                // Consumer can call e.preventDefault() to prevent the modal from closing.
                await Promise.resolve(closeButtonProps?.onClick?.(e));
                if (!e.defaultPrevented) {
                  handleClose();
                }
              }}
              sx={{ ml: 'auto', ...closeButtonProps?.sx }}
            >
              <CancelIcon />
            </IconButton>
          </Stack>
        )}

        {/* MRT_NewEntryFormProvider wraps body + footer so both share the same RHF context and <form> element */}
        <MRT_NewEntryFormProvider table={table}>
          {/* Scrollable body — MRT_NewEntryForm auto-generates fields from column definitions */}
          <Stack
            flex={1}
            minHeight={0}
            overflow="auto"
            px={2}
            {...bodyProps}
            sx={{
              pb: 1,
              pt: 2,
              scrollbarColor: `${theme.palette.action.disabled} transparent`,
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': {
                width: 6,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.action.disabled,
                borderRadius: 999,
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: theme.palette.action.active,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
              ...bodySx,
            }}
          >
            <MRT_NewEntryForm table={table} />
          </Stack>

          {/* Footer — MRT_NewEntryFormActions owns its own Stack with footerProps/footerSx */}
          <MRT_NewEntryFormActions table={table} />
        </MRT_NewEntryFormProvider>
      </Stack>
    </Modal>
  );
};
