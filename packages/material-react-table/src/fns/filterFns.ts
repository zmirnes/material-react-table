import {
  type RankingInfo,
  rankItem,
  rankings,
} from '@tanstack/match-sorter-utils';
import { type Row, filterFns } from '@tanstack/react-table';
import { type MRT_RowData } from '../types';

const fuzzy = <TData extends MRT_RowData>(
  row: Row<TData>,
  columnId: string,
  filterValue: number | string,
  addMeta: (item: RankingInfo) => void,
): boolean => {
  const itemRank = rankItem(
    row.getValue<string | number | null>(columnId),
    filterValue as string,
    {
      threshold: rankings.MATCHES,
    },
  );
  addMeta(itemRank);
  return itemRank.passed;
};

fuzzy.autoRemove = (val: unknown) => !val;

const contains = <TData extends MRT_RowData>(
  row: Row<TData>,
  id: string,
  filterValue: number | string,
): boolean =>
  !!row
    .getValue<number | string | null>(id)
    ?.toString()
    .toLowerCase()
    .trim()
    .includes(filterValue.toString().toLowerCase().trim());

contains.autoRemove = (val: unknown) => !val;

const startsWith = <TData extends MRT_RowData>(
  row: Row<TData>,
  id: string,
  filterValue: number | string,
): boolean =>
  !!row
    .getValue<number | string | null>(id)
    ?.toString()
    .toLowerCase()
    .trim()
    .startsWith(filterValue.toString().toLowerCase().trim());

startsWith.autoRemove = (val: unknown) => !val;

const endsWith = <TData extends MRT_RowData>(
  row: Row<TData>,
  id: string,
  filterValue: number | string,
): boolean =>
  !!row
    .getValue<number | string | null>(id)
    ?.toString()
    .toLowerCase()
    .trim()
    .endsWith(filterValue.toString().toLowerCase().trim());

endsWith.autoRemove = (val: unknown) => !val;

const equals = <TData extends MRT_RowData>(
  row: Row<TData>,
  id: string,
  filterValue: number | string,
): boolean =>
  row.getValue<number | string | null>(id)?.toString().toLowerCase().trim() ===
  filterValue.toString().toLowerCase().trim();

equals.autoRemove = (val: unknown) => !val;

const notEquals = <TData extends MRT_RowData>(
  row: Row<TData>,
  id: string,
  filterValue: number | string,
): boolean =>
  row.getValue<number | string | null>(id)?.toString().toLowerCase().trim() !==
  filterValue.toString().toLowerCase().trim();

notEquals.autoRemove = (val: unknown) => !val;

const greaterThan = <TData extends MRT_RowData>(
  row: Row<TData>,
  id: string,
  filterValue: number | string,
): boolean =>
  !isNaN(+filterValue) && !isNaN(+row.getValue<number | string>(id))
    ? +(row.getValue<number | string | null>(id) ?? 0) > +filterValue
    : (row.getValue<number | string | null>(id) ?? '')
        ?.toString()
        .toLowerCase()
        .trim() > filterValue.toString().toLowerCase().trim();

greaterThan.autoRemove = (val: unknown) => !val;

const greaterThanOrEqualTo = <TData extends MRT_RowData>(
  row: Row<TData>,
  id: string,
  filterValue: number | string,
): boolean => equals(row, id, filterValue) || greaterThan(row, id, filterValue);

greaterThanOrEqualTo.autoRemove = (val: unknown) => !val;

const lessThan = <TData extends MRT_RowData>(
  row: Row<TData>,
  id: string,
  filterValue: number | string,
): boolean =>
  !isNaN(+filterValue) && !isNaN(+row.getValue<number | string>(id))
    ? +(row.getValue<number | string | null>(id) ?? 0) < +filterValue
    : (row.getValue<number | string | null>(id) ?? '')
        ?.toString()
        .toLowerCase()
        .trim() < filterValue.toString().toLowerCase().trim();

lessThan.autoRemove = (val: unknown) => !val;

const lessThanOrEqualTo = <TData extends MRT_RowData>(
  row: Row<TData>,
  id: string,
  filterValue: number | string,
): boolean => equals(row, id, filterValue) || lessThan(row, id, filterValue);

lessThanOrEqualTo.autoRemove = (val: unknown) => !val;

const between = <TData extends MRT_RowData>(
  row: Row<TData>,
  id: string,
  filterValues: [number | string, number | string],
): boolean =>
  ((['', undefined] as (string | number | undefined)[]).includes(
    filterValues[0],
  ) ||
    greaterThan(row, id, filterValues[0])) &&
  ((!isNaN(+filterValues[0]) &&
    !isNaN(+filterValues[1]) &&
    +filterValues[0] > +filterValues[1]) ||
    (['', undefined] as (string | number | undefined)[]).includes(
      filterValues[1],
    ) ||
    lessThan(row, id, filterValues[1]));

between.autoRemove = (val: unknown) => !val;

const betweenInclusive = <TData extends MRT_RowData>(
  row: Row<TData>,
  id: string,
  filterValues: [number | string, number | string],
): boolean =>
  ((['', undefined] as (string | number | undefined)[]).includes(
    filterValues[0],
  ) ||
    greaterThanOrEqualTo(row, id, filterValues[0])) &&
  ((!isNaN(+filterValues[0]) &&
    !isNaN(+filterValues[1]) &&
    +filterValues[0] > +filterValues[1]) ||
    (['', undefined] as (string | number | undefined)[]).includes(
      filterValues[1],
    ) ||
    lessThanOrEqualTo(row, id, filterValues[1]));

betweenInclusive.autoRemove = (val: unknown) => !val;

const empty = <TData extends MRT_RowData>(
  row: Row<TData>,
  id: string,
  _filterValue: number | string,
): boolean => !row.getValue<number | string | null>(id)?.toString().trim();

empty.autoRemove = (val: unknown) => !val;

const notEmpty = <TData extends MRT_RowData>(
  row: Row<TData>,
  id: string,
  _filterValue: number | string,
): boolean => !!row.getValue<number | string | null>(id)?.toString().trim();

notEmpty.autoRemove = (val: unknown) => !val;

export const MRT_FilterFns = {
  ...filterFns,
  between,
  betweenInclusive,
  contains,
  empty,
  endsWith,
  equals,
  fuzzy,
  greaterThan,
  greaterThanOrEqualTo,
  lessThan,
  lessThanOrEqualTo,
  notEmpty,
  notEquals,
  startsWith,
};
