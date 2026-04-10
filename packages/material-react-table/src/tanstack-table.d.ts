import '@tanstack/react-table'; //or vue, svelte, solid, qwik, etc.

export interface IIconColTypeValue {
  color: string;
  description: string;
  iconCode: number;
  additional?: Record<string, Omit<IIconColTypeValue, 'additional'>>;
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
