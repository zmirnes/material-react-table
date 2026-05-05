import { describe, expect, it, vi } from 'vitest';
import {
  type MRT_Row,
  type MRT_RowData,
  type MRT_TableInstance,
  type MRT_ValidateTreeRowMoveContext,
} from '../../types';
import { getIsTreeRowMoveAllowed } from '../../utils/row.utils';

type TestRow = MRT_RowData & {
  id: string;
  name: string;
};

const createContext = (
  validate?: (
    context: MRT_ValidateTreeRowMoveContext<TestRow>,
  ) => boolean,
): MRT_ValidateTreeRowMoveContext<TestRow> => {
  const table = {
    options: {
      validateTreeRowMove: validate,
    },
  } as MRT_TableInstance<TestRow>;

  const row = {
    id: 'row-1',
  } as MRT_Row<TestRow>;

  return {
    direction: 'into',
    sourceRows: [row],
    table,
    targetRow: row,
  };
};

describe('getIsTreeRowMoveAllowed', () => {
  it('returns true when validator is not defined', () => {
    const context = createContext();

    const result = getIsTreeRowMoveAllowed({ context });

    expect(result).toBe(true);
  });

  it('returns true when validator returns true', () => {
    const validateTreeRowMove = vi.fn(() => true);
    const context = createContext(validateTreeRowMove);

    const result = getIsTreeRowMoveAllowed({
      context,
      validateTreeRowMove,
    });

    expect(result).toBe(true);
    expect(validateTreeRowMove).toHaveBeenCalledTimes(1);
    expect(validateTreeRowMove).toHaveBeenCalledWith(context);
  });

  it('returns false when validator returns false', () => {
    const validateTreeRowMove = vi.fn(() => false);
    const context = createContext(validateTreeRowMove);

    const result = getIsTreeRowMoveAllowed({
      context,
      validateTreeRowMove,
    });

    expect(result).toBe(false);
    expect(validateTreeRowMove).toHaveBeenCalledTimes(1);
    expect(validateTreeRowMove).toHaveBeenCalledWith(context);
  });
});
