import Typography from '@mui/material/Typography';
import MRT_ActiveFilterItemContainer from '../../components/toolbar/MRT_ActiveFilterItemContainer';
import { getFilterColumn } from '../../components/advanced-filters/utils';
import {
  type MRT_FilterRule,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import { type DimensionFilterValue } from '../filterEditors';

const isDimensionFilterValue = (
  value: unknown,
): value is DimensionFilterValue =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const formatDimensionFilterValue = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  rule: MRT_FilterRule,
  value: DimensionFilterValue,
): string => {
  const column = getFilterColumn(table, rule.columnId);
  const configuredFieldOrder = column?.columnDef.meta?.dimensions?.fields ?? [];

  const keysFromValue = Object.keys(value).filter((key) => key !== 'rotation');
  const orderedFieldKeys =
    configuredFieldOrder.length > 0
      ? configuredFieldOrder.filter((key) => key in value)
      : keysFromValue;

  const formattedFields = orderedFieldKeys
    .map((fieldKey) => {
      const fieldValue = value[fieldKey];
      if (typeof fieldValue !== 'number') return null;
      return `${fieldKey}: ${fieldValue}`;
    })
    .filter((segment): segment is string => Boolean(segment));

  if (value.rotation === 1) {
    formattedFields.push(table.options.localization.dimensionRotationEnabled);
  }

  return formattedFields.join(', ');
};

const DimensionActiveFilterItem = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  rule: MRT_FilterRule,
) => {
  if (!isDimensionFilterValue(rule.value)) return null;

  const formattedValue = formatDimensionFilterValue(table, rule, rule.value);

  if (!formattedValue) return null;

  return (
    <MRT_ActiveFilterItemContainer table={table} rule={rule}>
      <Typography variant="body2">{formattedValue}</Typography>
    </MRT_ActiveFilterItemContainer>
  );
};

export default DimensionActiveFilterItem;
