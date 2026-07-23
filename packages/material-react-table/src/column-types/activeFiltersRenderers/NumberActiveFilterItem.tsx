import Typography from '@mui/material/Typography';
import MRT_ActiveFilterItemContainer from '../../components/toolbar/MRT_ActiveFilterItemContainer';
import {
  type MRT_FilterRule,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';

const NumberActiveFilterItem = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  rule: MRT_FilterRule,
) => {
  if (typeof rule.value !== 'number' && !Array.isArray(rule.value)) return null;

  if (rule.operator === 'isAnyOf' && Array.isArray(rule.value)) {
    return (
      <MRT_ActiveFilterItemContainer table={table} rule={rule}>
        <Typography variant="body2">{rule.value.join(', ')}</Typography>
      </MRT_ActiveFilterItemContainer>
    );
  }

  return (
    <MRT_ActiveFilterItemContainer table={table} rule={rule}>
      <Typography variant="body2">{rule.value}</Typography>
    </MRT_ActiveFilterItemContainer>
  );
};

export default NumberActiveFilterItem;
