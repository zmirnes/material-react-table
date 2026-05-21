import { MRT_ActionMenuItem } from '../MRT_ActionMenuItem';
import { type MRT_RowData, type MRT_TableInstance } from '../../../types';

interface ResetStateMenuItemProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
  onCloseMenu: () => void;
}

export function ResetStateMenuItem<TData extends MRT_RowData>({
  table,
  onCloseMenu,
}: ResetStateMenuItemProps<TData>) {
  const {
    options: {
      icons: { RestartAltIcon },
      localization,
      resetState,
    },
  } = table;

  const defaultResetState = () => {
    table.resetSorting(true);
    table.resetColumnFilters(true);
    table.resetGlobalFilter(true);
    table.resetPagination(true);
    table.resetColumnOrder(true);
    table.resetGrouping(true);
    table.resetExpanded(true);
    table.resetRowSelection(true);
    table.resetColumnVisibility(true);
    table.resetColumnPinning(true);
  };

  const handleResetState = async () => {
    if (resetState) {
      resetState(table);
    } else {
      defaultResetState();
    }
    onCloseMenu();
  };

  const resetStateLabel = localization.resetState;

  return (
    <MRT_ActionMenuItem
      icon={<RestartAltIcon />}
      label={resetStateLabel}
      onClick={handleResetState}
      table={table}
    />
  );
}
