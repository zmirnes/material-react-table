import { type ReactNode } from 'react';
import { ResetStateMenuItem } from '../../components/menus/items/ResetStateMenuItem';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

interface CreateTableOptionsMenuItemsParams<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
  onCloseMenu: () => void;
}

export function createTableOptionsMenuItems<TData extends MRT_RowData>({
  table,
  onCloseMenu,
}: CreateTableOptionsMenuItemsParams<TData>): ReactNode[] {
  const {
    options: { menuOptions },
  } = table;
  return (menuOptions ?? []).map((option) => {
    switch (option) {
      case 'reset-state':
        return (
          <ResetStateMenuItem
            key={option}
            table={table}
            onCloseMenu={onCloseMenu}
          />
        );
      default:
        return null;
    }
  });
}
