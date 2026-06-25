import { MaterialReactServerTable } from '../../components/MaterialReactServerTable';
import { MRT_Localization_HR } from '../../locales/hr';
import { type MRT_RowData, type MRT_TableOptions } from '../../types';
import { render, screen, within } from '@testing-library/react';
import type userEvent from '@testing-library/user-event';

const { columnActions, groupByColumn } = MRT_Localization_HR;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Renders a MaterialReactServerTable with the given table options.
 * Extracts columns, data, and initialState to pass them through loadConfig/loadData.
 *
 * Pass `{ failConfig: true }` to simulate a failed config load, in which case
 * `loadConfig` rejects and the table renders the error component.
 *
 * `configDelay` (ms) defers the `loadConfig` resolution/rejection to a real
 * macrotask, guaranteeing the loading skeleton is mounted when a synchronous
 * assertion runs right after render (otherwise the config may resolve in the
 * same microtask flush as render and the skeleton is never observable).
 */
export const renderServerTable = <TData extends MRT_RowData & { id: string }>(
  tableOptions: MRT_TableOptions<TData>,
  {
    failConfig = false,
    configDelay = 0,
  }: { configDelay?: number; failConfig?: boolean } = {},
) => {
  const { columns, data = [], initialState, ...restOptions } = tableOptions;
  render(
    <MaterialReactServerTable<TData>
      loadConfig={async () => {
        if (configDelay > 0) {
          await sleep(configDelay);
        }
        if (failConfig) {
          throw new Error('failed to load config');
        }
        return {
          columns,
          initialState,
        };
      }}
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

/**
 * Groups the table by a given column using the column action menu.
 * Calls openColumnMenu internally, so no prior menu interaction is needed.
 */
export const groupTableByColumn = async (
  user: ReturnType<typeof userEvent.setup>,
  columnHeaderText: string,
) => {
  await openColumnMenu(user, columnHeaderText);
  // Build the menu item label from the HR localization template e.g. "Grupiraj po First Name"
  const groupByMenuItemLabel = groupByColumn.replace(
    '{column}',
    columnHeaderText,
  );
  const groupByMenuItem = screen.getByRole('menuitem', {
    name: groupByMenuItemLabel,
  });
  await user.click(groupByMenuItem);
};
