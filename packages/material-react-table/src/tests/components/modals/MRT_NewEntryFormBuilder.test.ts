import {
  buildDefaultValues,
  groupFieldsBySection,
  resolveFormFields,
  sortByOrder,
  type MRT_FormFieldEntry,
} from '../../../components/modals/MRT_NewEntryFormBuilder';
import { type MRT_TableInstance } from '../../../types';
import { describe, expect, it } from 'vitest';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Minimal column shape accepted by resolveFormFields and buildDefaultValues.
interface MockColumn {
  id: string;
  columnDefType?: 'data' | 'display' | 'group';
  formField?:
    | Record<string, unknown>
    | ((...args: unknown[]) => unknown)
    | null;
}

// Builds a minimal MRT_TableInstance stub for builder function tests.
// Only the fields actually read by the builder functions are populated.
const buildMockTable = ({
  columns = [] as MockColumn[],
  formConfig = {} as Record<string, unknown>,
}: {
  columns?: MockColumn[];
  formConfig?: Record<string, unknown>;
} = {}): MRT_TableInstance<Record<string, unknown>> =>
  ({
    getAllLeafColumns: () =>
      columns.map((col) => ({
        id: col.id,
        columnDef: {
          columnDefType: col.columnDefType ?? 'data',
          formField: col.formField ?? undefined,
        },
      })),
    getState: () => ({ newEntryModal: { open: true } }),
    options: { formConfig },
  }) as unknown as MRT_TableInstance<Record<string, unknown>>;

// ─── sortByOrder ──────────────────────────────────────────────────────────────

describe('sortByOrder', () => {
  it('returns items sorted ascending by order', () => {
    const items = [{ order: 3 }, { order: 1 }, { order: 2 }];
    expect(sortByOrder(items)).toEqual([
      { order: 1 },
      { order: 2 },
      { order: 3 },
    ]);
  });

  it('places items without an order value at the end', () => {
    const items = [{ order: undefined }, { order: 2 }, { order: 1 }];
    expect(sortByOrder(items)).toEqual([
      { order: 1 },
      { order: 2 },
      { order: undefined },
    ]);
  });

  it('returns a new array and does not mutate the original', () => {
    const items = [{ order: 2 }, { order: 1 }];
    const sorted = sortByOrder(items);
    // Original order is unchanged.
    expect(items[0].order).toBe(2);
    expect(sorted[0].order).toBe(1);
  });

  it('returns an empty array when given an empty input', () => {
    expect(sortByOrder([])).toEqual([]);
  });

  it('returns a single-item array unchanged', () => {
    expect(sortByOrder([{ order: 5 }])).toEqual([{ order: 5 }]);
  });
});

// ─── resolveFormFields ────────────────────────────────────────────────────────

describe('resolveFormFields', () => {
  it('includes data columns in the resolved fields', () => {
    const table = buildMockTable({
      columns: [{ id: 'name', columnDefType: 'data' }],
    });
    const fields = resolveFormFields(table);
    expect(fields).toHaveLength(1);
    expect(fields[0].columnId).toBe('name');
  });

  it('excludes display columns from the resolved fields', () => {
    const table = buildMockTable({
      columns: [
        { id: 'name', columnDefType: 'data' },
        { id: 'mrt-row-actions', columnDefType: 'display' },
      ],
    });
    const fields = resolveFormFields(table);
    // Only the data column is included — display columns are always excluded.
    expect(fields).toHaveLength(1);
    expect(fields[0].columnId).toBe('name');
  });

  it('excludes columns listed in formConfig.excludeColumns', () => {
    const table = buildMockTable({
      columns: [
        { id: 'name', columnDefType: 'data' },
        { id: 'internalId', columnDefType: 'data' },
      ],
      formConfig: { excludeColumns: ['internalId'] },
    });
    const fields = resolveFormFields(table);
    expect(fields.map((f) => f.columnId)).not.toContain('internalId');
  });

  it('excludes columns whose formField config has disabled: true', () => {
    const table = buildMockTable({
      columns: [
        { id: 'name', columnDefType: 'data' },
        { id: 'secret', columnDefType: 'data', formField: { disabled: true } },
      ],
    });
    const fields = resolveFormFields(table);
    expect(fields.map((f) => f.columnId)).not.toContain('secret');
  });

  it('sets fieldConfig to null when formField is a render function', () => {
    const table = buildMockTable({
      columns: [{ id: 'name', columnDefType: 'data', formField: () => null }],
    });
    const fields = resolveFormFields(table);
    expect(fields[0].fieldConfig).toBeNull();
  });

  it('populates fieldConfig when formField is a config object', () => {
    const table = buildMockTable({
      columns: [
        {
          id: 'name',
          columnDefType: 'data',
          formField: { label: 'Full Name' },
        },
      ],
    });
    const fields = resolveFormFields(table);
    expect(fields[0].fieldConfig).toMatchObject({ label: 'Full Name' });
  });

  it('sets sectionId from fieldConfig.section', () => {
    const table = buildMockTable({
      columns: [
        {
          id: 'city',
          columnDefType: 'data',
          formField: { section: 'address' },
        },
      ],
    });
    const fields = resolveFormFields(table);
    expect(fields[0].sectionId).toBe('address');
  });

  it('sets sectionId to undefined when no section is configured', () => {
    const table = buildMockTable({
      columns: [{ id: 'name', columnDefType: 'data' }],
    });
    const fields = resolveFormFields(table);
    expect(fields[0].sectionId).toBeUndefined();
  });
});

// ─── groupFieldsBySection ─────────────────────────────────────────────────────

describe('groupFieldsBySection', () => {
  it('groups fields by their sectionId', () => {
    const fields: MRT_FormFieldEntry<Record<string, unknown>>[] = [
      {
        columnId: 'city',
        columnDef: {} as never,
        fieldConfig: null,
        sectionId: 'address',
        order: undefined,
      },
      {
        columnId: 'zip',
        columnDef: {} as never,
        fieldConfig: null,
        sectionId: 'address',
        order: undefined,
      },
      {
        columnId: 'name',
        columnDef: {} as never,
        fieldConfig: null,
        sectionId: 'personal',
        order: undefined,
      },
    ];
    const grouped = groupFieldsBySection(fields);
    // Both address fields are in the 'address' group.
    expect(grouped['address']).toHaveLength(2);
    expect(grouped['personal']).toHaveLength(1);
  });

  it('excludes fields without a sectionId from the result', () => {
    const fields: MRT_FormFieldEntry<Record<string, unknown>>[] = [
      {
        columnId: 'name',
        columnDef: {} as never,
        fieldConfig: null,
        sectionId: undefined,
        order: undefined,
      },
      {
        columnId: 'city',
        columnDef: {} as never,
        fieldConfig: null,
        sectionId: 'address',
        order: undefined,
      },
    ];
    const grouped = groupFieldsBySection(fields);
    // The unsectioned 'name' field is not represented in the map.
    expect(Object.keys(grouped)).not.toContain('undefined');
    expect(grouped['address']).toHaveLength(1);
  });

  it('returns an empty object when all fields are unsectioned', () => {
    const fields: MRT_FormFieldEntry<Record<string, unknown>>[] = [
      {
        columnId: 'name',
        columnDef: {} as never,
        fieldConfig: null,
        sectionId: undefined,
        order: undefined,
      },
    ];
    expect(groupFieldsBySection(fields)).toEqual({});
  });
});

// ─── buildDefaultValues ───────────────────────────────────────────────────────

describe('buildDefaultValues', () => {
  describe('edit mode', () => {
    it('returns initialValues directly in edit mode without resolving column defaults', () => {
      const initialValues = { name: 'Alice', age: 30 };
      const table = buildMockTable({
        columns: [
          {
            id: 'name',
            columnDefType: 'data',
            formField: { defaultValue: 'fallback' },
          },
        ],
      });
      const result = buildDefaultValues(table, initialValues, 'edit');
      // Exact initialValues object is returned — column defaultValue is ignored.
      expect(result).toBe(initialValues);
    });
  });

  describe('create mode', () => {
    it('resolves static defaultValue from formField config', () => {
      const table = buildMockTable({
        columns: [
          {
            id: 'status',
            columnDefType: 'data',
            formField: { defaultValue: 'active' },
          },
        ],
      });
      const result = buildDefaultValues(table, undefined, 'create');
      expect(result['status']).toBe('active');
    });

    it('resolves factory-function defaultValue by calling it with no arguments', () => {
      const table = buildMockTable({
        columns: [
          {
            id: 'token',
            columnDefType: 'data',
            formField: { defaultValue: () => 'generated-token' },
          },
        ],
      });
      const result = buildDefaultValues(table, undefined, 'create');
      expect(result['token']).toBe('generated-token');
    });

    it('falls back to empty string when no defaultValue is configured', () => {
      const table = buildMockTable({
        columns: [{ id: 'name', columnDefType: 'data' }],
      });
      const result = buildDefaultValues(table, undefined, 'create');
      // undefined defaultValue resolves to empty string so RHF inputs are controlled.
      expect(result['name']).toBe('');
    });

    it('skips display columns when building default values', () => {
      const table = buildMockTable({
        columns: [
          { id: 'name', columnDefType: 'data' },
          { id: 'mrt-row-actions', columnDefType: 'display' },
        ],
      });
      const result = buildDefaultValues(table, undefined, 'create');
      expect(Object.keys(result)).not.toContain('mrt-row-actions');
    });

    it('skips disabled columns when building default values', () => {
      const table = buildMockTable({
        columns: [
          { id: 'name', columnDefType: 'data' },
          {
            id: 'secret',
            columnDefType: 'data',
            formField: { disabled: true },
          },
        ],
      });
      const result = buildDefaultValues(table, undefined, 'create');
      expect(Object.keys(result)).not.toContain('secret');
    });

    it('includes defaultValue for additionalFields in the result', () => {
      const table = buildMockTable({
        formConfig: {
          additionalFields: [
            { name: 'notes', defaultValue: 'n/a', render: () => null },
          ],
        },
      });
      const result = buildDefaultValues(table, undefined, 'create');
      expect(result['notes']).toBe('n/a');
    });
  });
});
