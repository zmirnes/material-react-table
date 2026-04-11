import '@tanstack/react-table'; //or vue, svelte, solid, qwik, etc.

export interface IIconColTypeValue {
  color: string;
  description: string;
  // String key — matches iconsList Record<string, ...> and cell value shape
  iconCode: string;
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
