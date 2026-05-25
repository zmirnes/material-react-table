import MRT_ActiveFilterItemContainer from '../../components/toolbar/MRT_ActiveFilterItemContainer';
import {
  type MRT_FilterRule,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';

const BooleanActiveFilterItem = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  rule: MRT_FilterRule,
) => {
  if (typeof rule.value !== 'boolean') return null;

  return (
    <MRT_ActiveFilterItemContainer table={table} rule={rule}>
      {rule.value
        ? table.options.localization.booleanTrue.toLowerCase()
        : table.options.localization.booleanFalse.toLowerCase()}
    </MRT_ActiveFilterItemContainer>
  );
};

export default BooleanActiveFilterItem;
