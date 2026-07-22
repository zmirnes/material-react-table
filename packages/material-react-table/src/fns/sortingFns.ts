import { type RankingInfo, compareItems } from '@tanstack/match-sorter-utils';
import {
  type Row,
  sortFn_alphanumeric,
  sortFn_alphanumericCaseSensitive,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  sortFn_textCaseSensitive,
} from '@tanstack/react-table';
import { type MRT_Features } from '../mrtTableFeatures';
import { type MRT_Row, type MRT_RowData } from '../types';

const fuzzy = <TData extends MRT_RowData>(
  rowA: Row<MRT_Features, TData>,
  rowB: Row<MRT_Features, TData>,
  columnId: string,
) => {
  let dir = 0;
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId] as RankingInfo,
      rowB.columnFiltersMeta[columnId] as RankingInfo,
    );
  }
  // Provide a fallback for when the item ranks are equal
  return dir === 0
    ? sortFn_alphanumeric(
        rowA as Row<MRT_Features, TData>,
        rowB as Row<MRT_Features, TData>,
        columnId,
      )
    : dir;
};

export const MRT_SortingFns = {
  alphanumeric: sortFn_alphanumeric,
  alphanumericCaseSensitive: sortFn_alphanumericCaseSensitive,
  basic: sortFn_basic,
  datetime: sortFn_datetime,
  text: sortFn_text,
  textCaseSensitive: sortFn_textCaseSensitive,
  fuzzy,
};

export const rankGlobalFuzzy = <TData extends MRT_RowData>(
  rowA: MRT_Row<TData>,
  rowB: MRT_Row<TData>,
) =>
  Math.max(
    ...Object.values(rowB.columnFiltersMeta).map(
      (v) => (v as RankingInfo).rank,
    ),
  ) -
  Math.max(
    ...Object.values(rowA.columnFiltersMeta).map(
      (v) => (v as RankingInfo).rank,
    ),
  );
