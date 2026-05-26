import { MaterialReactServerTable } from '../../components/MaterialReactServerTable';
import { MRT_Localization_HR } from '../../locales/hr';
import { type MRT_RowData, type MRT_TableOptions } from '../../types';
import { render, screen, within } from '@testing-library/react';
import type userEvent from '@testing-library/user-event';

const { columnActions } = MRT_Localization_HR;

/**
 * Renders a MaterialReactServerTable with the given table options.
 * Extracts columns, data, and initialState to pass them through loadConfig/loadData.
 */
export const renderServerTable = <TData extends MRT_RowData & { id: string }>(
  tableOptions: MRT_TableOptions<TData>,
) => {
  const { columns, data = [], initialState, ...restOptions } = tableOptions;
  render(
    <MaterialReactServerTable<TData>
      loadConfig={async () => ({
        columns,
        initialState,
      })}
      loadData={async () => ({
        data,
        rowCount: data.length,
      })}
      saveState={async () => {}}
      {...restOptions}
    />,
  );
};

/**
 * Opens the column action menu for a given column header text.
 * Waits for the async server table to finish loading before interacting.
 */
export const openColumnMenu = async (
  user: ReturnType<typeof userEvent.setup>,
  columnHeaderText: string,
) => {
  const headerText = await screen.findByText(columnHeaderText);
  const headerCell = headerText.closest('th')!;
  const columnActionsButton = within(headerCell).getByLabelText(columnActions);
  await user.click(columnActionsButton);
};
