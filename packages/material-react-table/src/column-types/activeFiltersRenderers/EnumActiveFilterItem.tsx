import Typography from '@mui/material/Typography';
import MRT_ActiveFilterItemContainer from '../../components/toolbar/MRT_ActiveFilterItemContainer';
import { getFilterColumn } from '../../components/advanced-filters/utils';
import {
  type MRT_FilterRule,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';

type EnumOption = {
  label: string;
  value: string;
};

const getEnumLabelByValue = (
  value: unknown,
  enumOptions: EnumOption[],
): string => {
  const normalizedValue = String(value ?? '');
  const matchingOption = enumOptions.find(
    (option) => option.value === normalizedValue,
  );

  return matchingOption?.label ?? normalizedValue;
};

const EnumActiveFilterItem = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  rule: MRT_FilterRule,
) => {
  if (typeof rule.value !== 'string' && !Array.isArray(rule.value)) return null;

  const column = getFilterColumn(table, rule.columnId);
  const enumOptions = column?.columnDef.meta?.enumValues ?? [];

  if (rule.operator === 'isAnyOf' && Array.isArray(rule.value)) {
    return (
      <MRT_ActiveFilterItemContainer table={table} rule={rule}>
        <Typography variant="body2">
          {rule.value
            .map((value) => getEnumLabelByValue(value, enumOptions))
            .join(', ')}
        </Typography>
      </MRT_ActiveFilterItemContainer>
    );
  }

  return (
    <MRT_ActiveFilterItemContainer table={table} rule={rule}>
      <Typography variant="body2">
        {getEnumLabelByValue(rule.value, enumOptions)}
      </Typography>
    </MRT_ActiveFilterItemContainer>
  );
};

export default EnumActiveFilterItem;
