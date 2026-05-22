import { ThemeProvider, useTheme } from '@mui/material/styles';
import { type MRT_ColumnDef, MaterialReactTable } from '../../src';
import { MRT_Localization_HR } from '../../src/locales/hr';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Features/Sub Row Tree Examples',
};

export default meta;

const columns: MRT_ColumnDef<(typeof data)[0]>[] = [
  {
    accessorKey: 'firstName',
    header: 'First Name',
    type: 'string',
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
    type: 'string',
  },
  {
    accessorKey: 'age',
    header: 'Age',
    type: 'number',
  },
  {
    accessorKey: 'address',
    header: 'Address',
    type: 'string',
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone Number',
    type: 'string',
  },
];

const data = [...Array(5)].map(() => ({
  address: faker.location.streetAddress(),
  age: faker.number.int(80),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  phoneNumber: faker.phone.number(),
  subRows: [...Array(faker.number.int(4))].map(() => ({
    address: faker.location.streetAddress(),
    age: faker.number.int(80),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phoneNumber: faker.phone.number(),
    subRows: [...Array(3)].map(() => ({
      address: faker.location.streetAddress(),
      age: faker.number.int(80),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phoneNumber: faker.phone.number(),
      subRows: [...Array(2)].map(() => ({
        address: faker.location.streetAddress(),
        age: faker.number.int(80),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phoneNumber: faker.phone.number(),
      })),
    })),
  })),
}));

export const SubRowTreeEnabledDefault = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableExpanding
    enableRowReordering
    enableRowPinning={false}
    displayColumnDefOptions={{
      'mrt-row-expand': {
        GroupedCell: ({ row }) => (
          <span style={{ fontWeight: 700 }}>
            {row.getValue('firstName')} ({row.subRows?.length ?? 0})
          </span>
        ),
      },
    }}
    maxDepth={3}
  />
);

export const SubRowTreeLayoutGrid = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    displayColumnDefOptions={{
      'mrt-row-expand': {
        // size: 100,
      },
    }}
    enableExpanding
    initialState={{ expanded: true }}
    layoutMode="grid"
  />
);

export const SubRowTreeLayoutGridNoGrow = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    displayColumnDefOptions={{
      'mrt-row-expand': {
        // size: 100,
      },
    }}
    enableExpanding
    initialState={{ expanded: true }}
    layoutMode="grid-no-grow"
  />
);

export const SubRowTreeEnabledPositionLast = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableExpanding
    positionExpandColumn="last"
  />
);

export const SubRowTreeEnabledDefaultRTL = () => {
  const theme = useTheme();
  return (
    <ThemeProvider theme={{ ...theme, direction: 'rtl' }}>
      <div style={{ direction: 'rtl' }}>
        <MaterialReactTable
          columns={columns}
          data={data}
          enableExpanding
          localization={MRT_Localization_HR}
        />
      </div>
    </ThemeProvider>
  );
};

export const SubRowTreeEnabledDefaultRTLAndPositionLast = () => {
  const theme = useTheme();
  return (
    <ThemeProvider theme={{ ...theme, direction: 'rtl' }}>
      <div style={{ direction: 'rtl' }}>
        <MaterialReactTable
          columns={columns}
          data={data}
          enableExpanding
          localization={MRT_Localization_HR}
          positionActionsColumn="last"
        />
      </div>
    </ThemeProvider>
  );
};

export const SubRowTreeDisableExpandAll = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableExpandAll={false}
    enableExpanding
  />
);

export const SubRowTreeFilterFromLeafRows = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableExpanding
    enablePagination={false}
    filterFromLeafRows
    initialState={{ expanded: true, showColumnFilters: true }}
  />
);

export const SubRowTreeMaxLeafRowFilterDepth0 = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableExpanding
    enablePagination={false}
    initialState={{ expanded: true, showColumnFilters: true }}
    maxLeafRowFilterDepth={0}
  />
);

export const SubRowTreeMaxLeafRowFilterDepth1 = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableExpanding
    enablePagination={false}
    initialState={{ expanded: true, showColumnFilters: true }}
    maxLeafRowFilterDepth={1}
  />
);

export const SubRowTreeMaxLeafRowFilterDepthAndFilterFromLeafRows = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableExpanding
    enablePagination={false}
    filterFromLeafRows
    initialState={{ expanded: true, showColumnFilters: true }}
    maxLeafRowFilterDepth={0}
  />
);

export const SubRowTreeWithSelection = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableExpanding
    enablePagination={false}
    enableRowSelection
  />
);

export const SubRowTreeWithSelectionNoSubRowSelection = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableExpanding
    enablePagination={false}
    enableRowSelection
    enableSubRowSelection={false}
  />
);

export const SubRowTreeWithSingleSelection = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableExpanding
    enableMultiRowSelection={false}
    enablePagination={false}
    enableRowSelection
  />
);
