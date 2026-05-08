import type { ReactElement } from 'react';
import { createDeleteAction } from '../../../utils/actions/createDeleteAction';
import {
  buildMockRow,
  buildMockTable,
  type TestRowData,
} from '../../helpers/actionMockBuilders';
import type { DeleteActionConfig } from '../../../types/actions-types';
import { describe, expect, it, vi } from 'vitest';

// Shape of the props that DeleteRowAction receives — only the fields we care about
type DeleteRowActionProps = {
  delete: () => void;
};

// Extracts the onDelete handler injected into the returned React element's props.
// React elements are plain objects — no rendering needed to access their props.
const extractDeleteHandler = (element: ReactElement): (() => void) =>
  (element.props as DeleteRowActionProps).delete;

describe('createDeleteAction', () => {
  it('returns an action with name "delete"', () => {
    const action = createDeleteAction<TestRowData>();

    expect(action.name).toBe('delete');
  });

  it('exposes renderToolbar and renderRow as functions', () => {
    const action = createDeleteAction<TestRowData>();

    expect(typeof action.renderToolbar).toBe('function');
    expect(typeof action.renderRow).toBe('function');
  });

  it('does not call onDelete when renderToolbar delete handler is invoked with no selected rows', () => {
    const mockDelete = vi.fn();
    const config: DeleteActionConfig<TestRowData> = { onDelete: mockDelete };
    const tableWithNoSelection = buildMockTable([]);

    const action = createDeleteAction<TestRowData>(config);
    const toolbarElement = action.renderToolbar!({
      table: tableWithNoSelection,
    }) as ReactElement;
    const onDelete = extractDeleteHandler(toolbarElement);

    onDelete();

    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('calls onDelete with the specific row ID when renderRow delete handler is invoked', () => {
    const mockDelete = vi.fn();
    const config: DeleteActionConfig<TestRowData> = { onDelete: mockDelete };
    const tableWithNoSelection = buildMockTable([]);
    const specificRow = buildMockRow('row-99');

    const action = createDeleteAction<TestRowData>(config);
    // renderRow returns a React element — extract its delete prop without mounting
    const rowElement = action.renderRow!({
      table: tableWithNoSelection,
      row: specificRow,
    }) as ReactElement;
    const onDelete = extractDeleteHandler(rowElement);

    onDelete();

    expect(mockDelete).toHaveBeenCalledOnce();
    expect(mockDelete).toHaveBeenCalledWith({
      rowsToDelete: ['row-99'],
      table: tableWithNoSelection,
    });
  });
});
