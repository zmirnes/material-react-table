import { IconButtonPropsColorOverrides } from '@mui/material';
import { OverridableStringUnion } from '@mui/types';
import '@tanstack/react-table'; //or vue, svelte, solid, qwik, etc.

export interface IIconColTypeValue {
  color: OverridableStringUnion<
    'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning',
    IconButtonPropsColorOverrides
  >;
  description: string;
  iconCode: number;
  additional?: Record<
    string,
    { color: string; description: string; iconCode: number }
  >;
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    enumValues?: Array<{ value: string; label: string }>;
    availableIcons?: Array<{
      iconType: IIconColTypeValue;
      tooltip: string;
      value: unknown;
    }>;
    extraFieldFilters?: { field: string; type: string }[];
  }
}
