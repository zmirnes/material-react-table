import { resolveRowsToDelete } from '../../../utils/actions/resolveRowsToDelete';
import { buildMockRow, buildMockTable } from '../../helpers/actionMockBuilders';
import { describe, expect, it } from 'vitest';

describe('resolveRowsToDelete', () => {
  it('returns only the provided row ID when a specific row is given', () => {
    const specificRow = buildMockRow('row-1');
    const tableWithNoSelection = buildMockTable([]);

    const result = resolveRowsToDelete(tableWithNoSelection, specificRow);

    expect(result).toEqual(['row-1']);
  });

  it('returns all selected row IDs when no specific row is provided', () => {
    const tableWithTwoSelectedRows = buildMockTable(['row-2', 'row-3']);

    const result = resolveRowsToDelete(tableWithTwoSelectedRows);

    expect(result).toEqual(['row-2', 'row-3']);
  });

  it('returns an empty array when no row is provided and no rows are selected', () => {
    const tableWithNoSelection = buildMockTable([]);

    const result = resolveRowsToDelete(tableWithNoSelection);

    expect(result).toEqual([]);
  });
});
