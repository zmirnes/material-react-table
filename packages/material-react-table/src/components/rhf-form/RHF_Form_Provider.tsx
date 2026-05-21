import type { FormEventHandler, HTMLAttributes, ReactNode } from 'react';
import { FormProvider as RHFFormProvider } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';

// Props for RHF_FormProvider — combines RHF FormProvider with the native <form> element.
// Pass the UseFormReturn instance from useForm() as `methods`.
// Pass `onSubmit` as the form submit handler (typically methods.handleSubmit(...)).
export interface RHF_FormProviderProps extends HTMLAttributes<HTMLFormElement> {
  // RHF form instance returned by useForm().
  methods: UseFormReturn<Record<string, unknown>>;
  // Called when the form is submitted — use methods.handleSubmit(onValid) here.
  onSubmit?: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
}

// Thin wrapper that provides RHF context to all descendants and wraps them in a native <form>.
// Keeps RHF's FormProvider and the HTML form element co-located so submit behaviour
// (Enter key, type="submit" buttons, browser semantics) works correctly out of the box.
export const RHF_FormProvider = ({
  methods,
  onSubmit,
  children,
  ...formProps
}: RHF_FormProviderProps) => (
  <RHFFormProvider {...methods}>
    <form noValidate onSubmit={onSubmit} {...formProps}>
      {children}
    </form>
  </RHFFormProvider>
);
