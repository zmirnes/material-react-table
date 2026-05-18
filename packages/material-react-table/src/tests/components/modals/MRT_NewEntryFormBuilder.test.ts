import {
  buildDefaultValues,
  groupFieldsBySection,
  resolveFormFields,
  sortByOrder,
  type MRT_FormFieldEntry,
} from '../../../components/modals/MRT_NewEntryFormBuilder';
import { useMaterialReactTable } from '../../../hooks/useMaterialReactTable';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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
    const { result } = renderHook(() =>
      useMaterialReactTable<Record<string, unknown>>({
        columns: [{ accessorKey: 'name', header: 'Name', type: 'string' }],
        data: [],
      }),
    );
    const fields = resolveFormFields(result.current);
    expect(fields).toHaveLength(1);
    expect(fields[0].columnId).toBe('name');
  });

  it('excludes display columns from the resolved fields', () => {
    // enableRowSelection causes MRT to inject an internal mrt-row-select display column.
    const { result } = renderHook(() =>
      useMaterialReactTable<Record<string, unknown>>({
        columns: [{ accessorKey: 'name', header: 'Name', type: 'string' }],
        data: [],
        enableRowSelection: true,
      }),
    );
    const fields = resolveFormFields(result.current);
    // Only the user data column is included — internal display columns are excluded.
    expect(fields).toHaveLength(1);
    expect(fields[0].columnId).toBe('name');
  });

  it('excludes columns listed in formConfig.excludeColumns', () => {
    const { result } = renderHook(() =>
      useMaterialReactTable<Record<string, unknown>>({
        columns: [
          { accessorKey: 'name', header: 'Name', type: 'string' },
          { accessorKey: 'internalId', header: 'Internal ID', type: 'string' },
        ],
        data: [],
        formConfig: { excludeColumns: ['internalId'] },
      }),
    );
    const fields = resolveFormFields(result.current);
    expect(fields.map((f) => f.columnId)).not.toContain('internalId');
  });

  it('includes columns whose formField config has disabled: true — disabled affects the input, not field presence', () => {
    const { result } = renderHook(() =>
      useMaterialReactTable<Record<string, unknown>>({
        columns: [
          { accessorKey: 'name', header: 'Name', type: 'string' },
          {
            accessorKey: 'secret',
            header: 'Secret',
            type: 'string',
            formField: { disabled: true },
          },
        ],
        data: [],
      }),
    );
    const fields = resolveFormFields(result.current);
    // disabled field is still included — it will be rendered as a disabled input.
    expect(fields.map((f) => f.columnId)).toContain('secret');
    // The fieldConfig carries the disabled flag so FormFieldControl can pass it to TextField.
    const secretField = fields.find((f) => f.columnId === 'secret');
    expect(secretField?.fieldConfig?.disabled).toBe(true);
  });

  it('sets fieldConfig to null when formField is a render function', () => {
    const { result } = renderHook(() =>
      useMaterialReactTable<Record<string, unknown>>({
        columns: [
          {
            accessorKey: 'name',
            header: 'Name',
            type: 'string',
            formField: () => null,
          },
        ],
        data: [],
      }),
    );
    const fields = resolveFormFields(result.current);
    expect(fields[0].fieldConfig).toBeNull();
  });

  it('populates fieldConfig when formField is a config object', () => {
    const { result } = renderHook(() =>
      useMaterialReactTable<Record<string, unknown>>({
        columns: [
          {
            accessorKey: 'name',
            header: 'Name',
            type: 'string',
            formField: { label: 'Full Name' },
          },
        ],
        data: [],
      }),
    );
    const fields = resolveFormFields(result.current);
    expect(fields[0].fieldConfig).toMatchObject({ label: 'Full Name' });
  });

  it('sets sectionId from fieldConfig.section', () => {
    const { result } = renderHook(() =>
      useMaterialReactTable<Record<string, unknown>>({
        columns: [
          {
            accessorKey: 'city',
            header: 'City',
            type: 'string',
            formField: { section: 'address' },
          },
        ],
        data: [],
      }),
    );
    const fields = resolveFormFields(result.current);
    expect(fields[0].sectionId).toBe('address');
  });

  it('sets sectionId to undefined when no section is configured', () => {
    const { result } = renderHook(() =>
      useMaterialReactTable<Record<string, unknown>>({
        columns: [{ accessorKey: 'name', header: 'Name', type: 'string' }],
        data: [],
      }),
    );
    const fields = resolveFormFields(result.current);
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
      const { result } = renderHook(() =>
        useMaterialReactTable<Record<string, unknown>>({
          columns: [
            {
              accessorKey: 'name',
              header: 'Name',
              type: 'string',
              formField: { defaultValue: 'fallback' },
            },
          ],
          data: [],
        }),
      );
      const values = buildDefaultValues(result.current, initialValues, 'edit');
      // Exact initialValues object is returned — column defaultValue is ignored.
      expect(values).toBe(initialValues);
    });
  });

  describe('create mode', () => {
    it('resolves static defaultValue from formField config', () => {
      const { result } = renderHook(() =>
        useMaterialReactTable<Record<string, unknown>>({
          columns: [
            {
              accessorKey: 'status',
              header: 'Status',
              type: 'string',
              formField: { defaultValue: 'active' },
            },
          ],
          data: [],
        }),
      );
      const values = buildDefaultValues(result.current, undefined, 'create');
      expect(values['status']).toBe('active');
    });

    it('resolves factory-function defaultValue by calling it with no arguments', () => {
      const { result } = renderHook(() =>
        useMaterialReactTable<Record<string, unknown>>({
          columns: [
            {
              accessorKey: 'token',
              header: 'Token',
              type: 'string',
              formField: { defaultValue: () => 'generated-token' },
            },
          ],
          data: [],
        }),
      );
      const values = buildDefaultValues(result.current, undefined, 'create');
      expect(values['token']).toBe('generated-token');
    });

    it('falls back to empty string when no defaultValue is configured', () => {
      const { result } = renderHook(() =>
        useMaterialReactTable<Record<string, unknown>>({
          columns: [{ accessorKey: 'name', header: 'Name', type: 'string' }],
          data: [],
        }),
      );
      const values = buildDefaultValues(result.current, undefined, 'create');
      // undefined defaultValue resolves to empty string so RHF inputs are controlled.
      expect(values['name']).toBe('');
    });

    it('skips display columns when building default values', () => {
      // enableRowSelection causes MRT to inject a real mrt-row-select display column.
      const { result } = renderHook(() =>
        useMaterialReactTable<Record<string, unknown>>({
          columns: [{ accessorKey: 'name', header: 'Name', type: 'string' }],
          data: [],
          enableRowSelection: true,
        }),
      );
      const values = buildDefaultValues(result.current, undefined, 'create');
      expect(Object.keys(values)).not.toContain('mrt-row-select');
    });

    it('includes disabled columns in default values — disabled fields are rendered and must have a value', () => {
      const { result } = renderHook(() =>
        useMaterialReactTable<Record<string, unknown>>({
          columns: [
            { accessorKey: 'name', header: 'Name', type: 'string' },
            {
              accessorKey: 'secret',
              header: 'Secret',
              type: 'string',
              formField: { disabled: true },
            },
          ],
          data: [],
        }),
      );
      const values = buildDefaultValues(result.current, undefined, 'create');
      expect(Object.keys(values)).toContain('secret');
    });

    it('includes defaultValue for additionalFields in the result', () => {
      const { result } = renderHook(() =>
        useMaterialReactTable<Record<string, unknown>>({
          columns: [],
          data: [],
          formConfig: {
            additionalFields: [
              { name: 'notes', defaultValue: 'n/a', render: () => null },
            ],
          },
        }),
      );
      const values = buildDefaultValues(result.current, undefined, 'create');
      expect(values['notes']).toBe('n/a');
    });
  });
});
