import '@tanstack/react-table'; //or vue, svelte, solid, qwik, etc.
import { MRT_ColumnDef } from './types';

export interface IIconColTypeValue {
  color: string;
  description: string;
  // String key — matches iconsList Record<string, ...> and cell value shape
  iconCode: string;
  additional?: Record<string, Omit<IIconColTypeValue, 'additional'>>;
}

// Shape of a single available icon option provided by the backend via column meta
export type MRT_AvailableIconOption = {
  iconType: IIconColTypeValue;
  tooltip: string;
  value: unknown;
};

// Shape of dimensions column definition
export interface MRT_DimensionsDef {
  fields: string[];
  tolerance?: { min: number; max: number };
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    enumValues?: Array<{ value: string; label: string }>;
    availableIcons?: MRT_AvailableIconOption[];
    dimensions?: MRT_DimensionsDef;
    extraFieldFilters?: MRT_ColumnDef[];
  }
}
