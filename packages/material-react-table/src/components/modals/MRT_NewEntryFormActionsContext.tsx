import { createContext, useContext } from 'react';

// Shared callback handlers exposed to sibling consumers (MRT_NewEntryForm, MRT_NewEntryFormActions).
// Separated from RHF FormProvider so each consumer picks only what it needs.
export interface MRT_NewEntryFormActionsContextValue {
  handleSave: () => Promise<void>;
  handleCancel: () => void;
}

export const MRT_NewEntryFormActionsContext =
  createContext<MRT_NewEntryFormActionsContextValue | null>(null);

// Hook used by MRT_NewEntryFormActions and MRT_NewEntryForm to access save/cancel handlers.
export const useMRT_NewEntryFormActions =
  (): MRT_NewEntryFormActionsContextValue => {
    const ctx = useContext(MRT_NewEntryFormActionsContext);
    if (ctx === null) {
      throw new Error(
        'useMRT_NewEntryFormActions must be used inside MRT_NewEntryFormProvider',
      );
    }
    return ctx;
  };
