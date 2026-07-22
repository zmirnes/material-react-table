import {
  aggregationFn_count,
  aggregationFn_extent,
  aggregationFn_first,
  aggregationFn_last,
  aggregationFn_max,
  aggregationFn_mean,
  aggregationFn_median,
  aggregationFn_min,
  aggregationFn_sum,
  aggregationFn_unique,
  aggregationFn_uniqueCount,
} from '@tanstack/react-table';

export const MRT_AggregationFns = {
  count: aggregationFn_count,
  extent: aggregationFn_extent,
  first: aggregationFn_first,
  last: aggregationFn_last,
  max: aggregationFn_max,
  mean: aggregationFn_mean,
  median: aggregationFn_median,
  min: aggregationFn_min,
  sum: aggregationFn_sum,
  unique: aggregationFn_unique,
  uniqueCount: aggregationFn_uniqueCount,
};
