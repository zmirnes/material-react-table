import { BooleanColumnResolver } from './boolean';
import { DateColumnResolver } from './date';
import { DateTimeColumnResolver } from './dateTime';
import { DimensionColumnResolver } from './dimension';
import { EnumColumnResolver } from './enum';
import { IconColumnResolver } from './icon';
import { NumberColumnResolver } from './number';
import { StringColumnResolver } from './string';
import { type ColumnType, type ColumnTypeResolver } from '../types';

export const columnTypeResolvers: Record<
  Exclude<ColumnType, 'object' | 'actions'>,
  ColumnTypeResolver
> = {
  string: StringColumnResolver,
  boolean: BooleanColumnResolver,
  date: DateColumnResolver,
  dateTime: DateTimeColumnResolver,
  dimension: DimensionColumnResolver,
  enum: EnumColumnResolver,
  icon: IconColumnResolver,
  number: NumberColumnResolver,
};
