import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react';
import { type MRT_ColumnDef } from '../../src';
import { Date } from '../../src/column-types/date';
import { EnumValue } from '../../src/column-types/enum';
import { MaterialReactServerTable } from '../../src/components/MaterialReactServerTable';
import Box from '@mui/material/Box';

const meta: Meta = {
  title: 'Features/Server Table',
};

export default meta;

type TrebovanjeMaterijala = {
  profil: boolean;
  ojacanje: boolean;
  aluclip: boolean;
  okov: boolean;
  ispuna: boolean;
  panel: boolean;
  inox: boolean;
  klupica: boolean;
  staklo: boolean;
  roletna: boolean;
  ostalo: boolean;
  dihtung: boolean;
};

type Person = {
  id: string;
  firstName: string;
  age: number;
  date: Date;
  dateTime: Date;
  enum: EnumValue;
  dimension: string;
  icon: {
    iconCode: string;
    description: string;
    additional?: Person['icon'][];
  };
};

interface IIconsList {
  [key: string]: {
    icon: string;
    defaultColor: string;
  };
}

const ICONS_LIST: IIconsList = {
  '1': {
    icon: 'mage:check-circle-fill',
    defaultColor: '#00b894',
  },
  '2': {
    icon: 'mage:check-circle',
    defaultColor: '#00b894',
  },
  '3': {
    icon: 'mdi:flash-circle',
    defaultColor: '#f39c12',
  },
  '4': {
    icon: 'material-symbols-light:bolt-outline',
    defaultColor: '#f39c12',
  },
  '5': {
    icon: 'tabler:cancel',
    defaultColor: '#95a5a6',
  },
  '6': {
    icon: 'line-md:close-circle',
    defaultColor: '#d63031',
  },
  '7': {
    icon: 'line-md:close-small',
    defaultColor: '#d63031',
  },
  '8': {
    icon: 'ph:warning',
    defaultColor: '#f39c12',
  },
  '9': {
    icon: 'material-symbols:error',
    defaultColor: '#d63031',
  },
  '10': {
    icon: 'codicon:info',
    defaultColor: '#bdc3c7',
  },
  '11': {
    icon: 'ep:success-filled',
    defaultColor: '#00b894',
  },
  '12': {
    icon: 'jam:triangle-danger-f',
    defaultColor: '#d63031',
  },
  '15': {
    icon: 'material-symbols:local-shipping-outline',
    defaultColor: '#00b894',
  },
  '16': {
    icon: 'wi:time-10',
    defaultColor: '#d63031',
  },
};

const fakeDatabase: Person[] = [...Array(100)].map(() => ({
  id: faker.string.uuid(),
  firstName: faker.person.firstName(),
  age: faker.number.int({ min: 18, max: 65 }),
  date: {
    date: '2026-04-29 00:00:00.000000',
    timezone: 'Europe/Sarajevo',
    timezone_type: 3,
  },
  dateTime: {
    date: '2026-04-29 12:34:56.000000',
    timezone: 'Europe/Sarajevo',
    timezone_type: 3,
  },
  enum: {
    value: faker.helpers.arrayElement(['option1', 'option2', 'option3']),
    label: faker.helpers.arrayElement(['Option 1', 'Option 2', 'Option 3']),
  },
  icon: {
    iconCode: '6',
    description: 'Missing',
    additional: [
      {
        iconCode: '10',
        description: 'Info',
      },
    ],
  },
  dimension: '100.000x200.000x300.000',
}));

const columns: MRT_ColumnDef<Person>[] = [
  { accessorKey: 'firstName', header: 'First Name', type: 'string' },
  { accessorKey: 'age', header: 'Age', type: 'number' },
  { accessorKey: 'date', header: 'Date', type: 'date' },
  { accessorKey: 'dateTime', header: 'Date Time', type: 'dateTime' },
  {
    accessorKey: 'enum',
    header: 'Enum',
    type: 'enum',
    meta: {
      enumValues: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
    },
  },
  {
    accessorKey: 'icon',
    header: 'Icon',
    type: 'icon',
    onClickIconTypeColumn: ({ row }) => {
      alert(`Icon clicked row: ${row.id}`);
    },
    iconsList: ICONS_LIST,
    meta: {
      availableIcons: Object.entries(ICONS_LIST).map(
        ([iconCode, { defaultColor }]) => ({
          iconType: {
            iconCode,
            description: `Icon ${iconCode}`,
            color: defaultColor,
          },
          tooltip: `Icon ${iconCode}`,
          value: iconCode,
        }),
      ),
    },
  },
  {
    accessorKey: 'dimension',
    header: 'Dimension',
    type: 'dimension',
    meta: {
      dimensions: {
        fields: ['length', 'width', 'height', 'tolerance'],
        tolerance: { min: 0.01, max: 1000 },
      },
    },
  },
  {
    // Column type is 'object' — not directly filterable.
    // Filter drawer exposes individual boolean sub-fields via extraFieldFilters.
    accessorKey: 'trebovanje_materijala',
    header: 'Trebovanje materijala',
    type: 'object',
    meta: {
      extraFieldFilters: [
        {
          accessorKey: 'trebovanje_materijala[profil]',
          header: 'Profil',
          type: 'boolean',
        },
        {
          accessorKey: 'trebovanje_materijala[ojacanje]',
          header: 'Ojačanje',
          type: 'boolean',
        },
        {
          accessorKey: 'trebovanje_materijala[aluclip]',
          header: 'Aluclip',
          type: 'boolean',
        },
        {
          accessorKey: 'trebovanje_materijala[okov]',
          header: 'Okov',
          type: 'boolean',
        },
        {
          accessorKey: 'trebovanje_materijala[ispuna]',
          header: 'Ispuna',
          type: 'boolean',
        },
        {
          accessorKey: 'trebovanje_materijala[panel]',
          header: 'Panel',
          type: 'boolean',
        },
        {
          accessorKey: 'trebovanje_materijala[inox]',
          header: 'Inox',
          type: 'boolean',
        },
        {
          accessorKey: 'trebovanje_materijala[klupica]',
          header: 'Klupica',
          type: 'boolean',
        },
        {
          accessorKey: 'trebovanje_materijala[staklo]',
          header: 'Staklo',
          type: 'boolean',
        },
        {
          accessorKey: 'trebovanje_materijala[roletna]',
          header: 'Roletna',
          type: 'boolean',
        },
        {
          accessorKey: 'trebovanje_materijala[ostalo]',
          header: 'Ostalo',
          type: 'boolean',
        },
        {
          accessorKey: 'trebovanje_materijala[dihtung]',
          header: 'Dihtung',
          type: 'boolean',
        },
      ],
    },
  },
];

const simulateDelay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
export const Basic = () => (
  <Box
    style={{
      height: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <MaterialReactServerTable<Person>
      loadConfig={async () => {
        await simulateDelay(800);
        return {
          columns,
          availableExports: {
            export_pozicija: {
              name: 'export_pozicija',
              label: 'Export pozicija',
              formats: ['xml', 'csv', 'xlsx'],
            },
            export_detalji: {
              name: 'export_detalji',
              label: 'Export detalji',
              formats: ['xml', 'csv', 'xlsx'],
            },
            export_finansije: {
              name: 'export_finansije',
              label: 'Export finansije',
              formats: ['xlsx', 'pdf'],
            },
            export_izvjestaj: {
              name: 'export_izvjestaj',
              label: 'Export izvještaj',
              formats: ['pdf'],
            },
            export_summary: {
              name: 'export_summary',
              label: 'Export sažetak',
              formats: ['csv', 'pdf'],
            },
            export_raw: {
              name: 'export_raw',
              label: 'Export raw data',
              formats: ['csv'],
            },
            export_radnici: {
              name: 'export_radnici',
              label: 'Export radnici',
              formats: ['xml', 'csv', 'xlsx'],
            },
            export_ugovori: {
              name: 'export_ugovori',
              label: 'Export ugovori',
              formats: ['xlsx', 'pdf'],
            },
            export_placanja: {
              name: 'export_placanja',
              label: 'Export plaćanja',
              formats: ['csv', 'xlsx'],
            },
            export_nalozi: {
              name: 'export_nalozi',
              label: 'Export nalozi',
              formats: ['xml', 'pdf'],
            },
            export_skladiste: {
              name: 'export_skladiste',
              label: 'Export skladište',
              formats: ['csv', 'xlsx'],
            },
            export_artikli: {
              name: 'export_artikli',
              label: 'Export artikli',
              formats: ['xml', 'csv', 'xlsx'],
            },
            export_nabava: {
              name: 'export_nabava',
              label: 'Export nabava',
              formats: ['xlsx', 'pdf'],
            },
            export_prodaja: {
              name: 'export_prodaja',
              label: 'Export prodaja',
              formats: ['csv', 'xlsx', 'pdf'],
            },
            export_knjizenje: {
              name: 'export_knjizenje',
              label: 'Export knjiženje',
              formats: ['xml', 'pdf'],
            },
            export_analitika: {
              name: 'export_analitika',
              label: 'Export analitika',
              formats: ['xlsx', 'pdf'],
            },
            export_kontrola: {
              name: 'export_kontrola',
              label: 'Export kontrola kvaliteta',
              formats: ['csv', 'xlsx'],
            },
          },
        };
      }}
      loadData={async (state) => {
        await simulateDelay(600);
        const { pageIndex, pageSize } = state.pagination;
        const start = pageIndex * pageSize;
        return {
          data: fakeDatabase.slice(start, start + pageSize),
          rowCount: fakeDatabase.length,
        };
      }}
      saveState={async () => {
        await simulateDelay(200);
      }}
      loadExport={async (params) => {
        await simulateDelay(1000);

        const buildXmlContent = (exportName: string) =>
          [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<export>',
            `  <type>${exportName}</type>`,
            `  <format>${params.format}</format>`,
            `  <ids>${params.ids}</ids>`,
            '  <rows>',
            '    <row><id>1</id><name>John Doe</name><age>30</age></row>',
            '    <row><id>2</id><name>Jane Smith</name><age>25</age></row>',
            '  </rows>',
            '</export>',
          ].join('\n');

        const buildCsvContent = (exportName: string) =>
          [
            'id,name,age,email,city',
            '1,John Doe,30,john@example.com,Sarajevo',
            '2,Jane Smith,25,jane@example.com,Mostar',
            '3,Bob Johnson,35,bob@example.com,Banja Luka',
            `# Export: ${exportName}`,
          ].join('\n');

        const buildXlsxContent = (exportName: string) =>
          `XLSX mock content for ${exportName} - ids: ${params.ids}`;

        const buildPdfContent = (exportName: string) =>
          `%PDF-1.4 mock for ${exportName}`;

        const getContent = (exportName: string): string => {
          switch (params.format) {
            case 'xml':
              return btoa(buildXmlContent(exportName));
            case 'csv':
              return btoa(buildCsvContent(exportName));
            case 'xlsx':
              return btoa(buildXlsxContent(exportName));
            case 'pdf':
              return btoa(buildPdfContent(exportName));
            default:
              return btoa(`Export: ${exportName}`);
          }
        };

        if (params.separated_files) {
          return params.exports.map((exportName) => ({
            filename: `${exportName}.${params.format ?? 'bin'}`,
            name: exportName,
            extension: params.format ?? 'bin',
            content: getContent(exportName),
          }));
        }

        const combinedContent = params.exports
          .map((exportName) => {
            switch (params.format) {
              case 'xml':
                return buildXmlContent(exportName);
              case 'csv':
                return buildCsvContent(exportName);
              default:
                return `${exportName}: mock content`;
            }
          })
          .join('\n\n');

        return [
          {
            filename: `export_combined.${params.format ?? 'bin'}`,
            name: 'combined',
            extension: params.format ?? 'bin',
            content: btoa(combinedContent),
          },
        ];
      }}
      getAllSelectableRowIds={async () => {
        await simulateDelay(1500);
        return fakeDatabase.map((row) => row.id);
      }}
      onSaveFilters={async () => {
        await simulateDelay(1000);
      }}
      onDeleteRow={async (row) => {
        await simulateDelay(400);
        const deletedRowIndex = fakeDatabase.findIndex(
          (dbRow) => dbRow.id === row.original.id,
        );
        if (deletedRowIndex !== -1) {
          fakeDatabase.splice(deletedRowIndex, 1);
        }
      }}
    />
  </Box>
);

export const WithInitialState = () => (
  <MaterialReactServerTable<Person>
    loadConfig={async () => {
      await simulateDelay(800);
      return {
        columns,
        initialState: {
          pagination: { pageIndex: 0, pageSize: 5 },
          density: 'comfortable',
        },
      };
    }}
    loadData={async (state) => {
      await simulateDelay(600);
      const { pageIndex, pageSize } = state.pagination;
      const start = pageIndex * pageSize;
      return {
        data: fakeDatabase.slice(start, start + pageSize),
        rowCount: fakeDatabase.length,
      };
    }}
    saveState={async () => {
      await simulateDelay(200);
    }}
  />
);

export const WithConfigError = () => (
  <MaterialReactServerTable<Person>
    loadConfig={async () => {
      await simulateDelay(800);
      throw new Error('Failed to load config');
    }}
    loadData={async () => ({
      data: [],
      rowCount: 0,
    })}
    saveState={async () => {}}
  />
);

export const WithGetTotalRows = () => (
  <MaterialReactServerTable<Person>
    loadConfig={async () => {
      await simulateDelay(800);
      return { columns };
    }}
    loadData={async (state) => {
      await simulateDelay(600);
      const { pageIndex, pageSize } = state.pagination;
      const start = pageIndex * pageSize;
      const slice = fakeDatabase.slice(start, start + pageSize + 1);
      const hasNextPage = slice.length > pageSize;

      return {
        data: slice.slice(0, pageSize),
        rowCount: fakeDatabase.length,
        hasNextPage,
      };
    }}
    saveState={async () => {
      await simulateDelay(200);
    }}
    getTotalRows={async () => {
      await simulateDelay(1000);
      return fakeDatabase.length;
    }}
  />
);

export const WithHasNextPage = () => (
  <MaterialReactServerTable<Person>
    loadConfig={async () => {
      await simulateDelay(800);
      return { columns };
    }}
    loadData={async (state) => {
      await simulateDelay(600);
      const { pageIndex, pageSize } = state.pagination;
      const start = pageIndex * pageSize;
      const slice = fakeDatabase.slice(start, start + pageSize + 1); // dohvati +1
      const hasNextPage = slice.length > pageSize;

      return {
        data: slice.slice(0, pageSize),
        rowCount: fakeDatabase.length,
        hasNextPage,
      };
    }}
    saveState={async () => {}}
  />
);
