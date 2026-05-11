import { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { type MRT_ColumnDef, MaterialReactTable } from '../../src';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Features/Virtualization',
};

export default meta;

const longData = [...Array(5000)].map(() => ({
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  country: faker.location.country(),
  email: faker.internet.email(),
  favoriteColor: faker.internet.color(),
  favoriteQuote: faker.lorem.sentence(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  middleName: faker.person.firstName(),
  petName: faker.animal.cat(),
  petType: faker.animal.type(),
  phoneNumber: faker.phone.number(),
  state: faker.location.state(),
  zipCode: faker.location.zipCode(),
}));

const longColumns: MRT_ColumnDef<(typeof longData)[0]>[] = [
  {
    accessorKey: 'firstName',
    header: 'First Name',
    type: 'string',
  },
  {
    accessorKey: 'middleName',
    header: 'Middle Name',
    type: 'string',
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
    type: 'string',
  },
  {
    accessorKey: 'email',
    header: 'Email Address',
    size: 300,
    type: 'string',
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone Number',
    type: 'string',
  },
  {
    accessorKey: 'address',
    header: 'Address',
    type: 'string',
  },
  {
    accessorKey: 'zipCode',
    header: 'Zip Code',
    type: 'string',
  },
  {
    accessorKey: 'city',
    header: 'City',
    type: 'string',
  },
  {
    accessorKey: 'state',
    header: 'State',
    type: 'string',
  },
  {
    accessorKey: 'country',
    header: 'Country',
    size: 200,
    type: 'string',
  },
  {
    accessorKey: 'favoriteColor',
    header: 'Favorite Color',
    type: 'string',
  },
  {
    accessorKey: 'favoriteQuote',
    header: 'Favorite Quote',
    size: 700,
    type: 'string',
  },
  {
    accessorKey: 'petName',
    header: 'Pet Name',
    type: 'string',
  },
  {
    accessorKey: 'petType',
    header: 'Pet Type',
    type: 'string',
  },
];

export const EnableRowVirtualizationDense = () => (
  <MaterialReactTable
    columns={longColumns}
    data={longData}
    enableBottomToolbar={false}
    enablePagination={false}
    enableRowVirtualization
    initialState={{ density: 'compact' }}
  />
);

export const EnableRowVirtualizationComfortable = () => (
  <MaterialReactTable
    columns={longColumns}
    data={longData}
    enableBottomToolbar={false}
    enablePagination={false}
    enableRowVirtualization
  />
);

export const EnableRowVirtualizationSpacious = () => (
  <MaterialReactTable
    columns={longColumns}
    data={longData}
    enableBottomToolbar={false}
    enablePagination={false}
    enableRowVirtualization
    initialState={{ density: 'spacious' }}
  />
);

export const EnableRowVirtualizationTallContent = () => (
  <MaterialReactTable
    columns={longColumns}
    data={longData}
    enableBottomToolbar={false}
    enableColumnResizing
    enablePagination={false}
    enableRowNumbers
    enableRowVirtualization
  />
);

export const VirtualizationConditionallyWontToggle = () => {
  const [enabled, setEnabled] = useState(true);
  return (
    <MaterialReactTable
      columns={longColumns}
      data={longData}
      enableBottomToolbar={false}
      enableColumnVirtualization={enabled}
      enablePagination={false}
      enableRowNumbers
      enableRowVirtualization={enabled}
      initialState={{ density: 'compact' }}
      renderTopToolbarCustomActions={() => (
        <Stack alignItems="center" direction="row">
          <Button onClick={() => setEnabled(!enabled)}>
            Toggle Virtualization
          </Button>
          * Virtualization features cannot be toggled
        </Stack>
      )}
    />
  );
};

export const EnableRowVirtualizationWithColumnResizing = () => (
  <MaterialReactTable
    columns={longColumns}
    data={longData}
    enableBottomToolbar={false}
    enableColumnResizing
    enablePagination={false}
    enableRowNumbers
    enableRowVirtualization
  />
);

export const EnableRowVirtualizationWithDetailPanel = () => (
  <MaterialReactTable
    columns={longColumns}
    data={longData}
    enableBottomToolbar={false}
    enablePagination={false}
    enableRowNumbers
    enableRowVirtualization
    renderDetailPanel={() => <div>Detail Panel</div>}
  />
);

export const EnableRowVirtualizationWithMemoizedCells = () => (
  <MaterialReactTable
    columns={longColumns}
    data={longData}
    enableBottomToolbar={false}
    enableDensityToggle={false}
    enablePagination={false}
    enableRowNumbers
    enableRowVirtualization
    initialState={{ density: 'compact' }}
    memoMode="cells"
  />
);

export const EnableRowVirtualizationWithMemoizedRows = () => (
  <MaterialReactTable
    columns={longColumns}
    data={longData}
    enableBottomToolbar={false}
    enableDensityToggle={false}
    enablePagination={false}
    enableRowNumbers
    enableRowVirtualization
    initialState={{ density: 'compact' }}
    memoMode="rows"
  />
);

export const EnableRowVirtualizationStickyFooter = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'firstName',
        footer: 'First Name',
        header: 'First Name',
        type: 'string',
      },
      {
        accessorKey: 'middleName',
        footer: 'Middle Name',
        header: 'Middle Name',
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        footer: 'Last Name',
        header: 'Last Name',
        type: 'string',
      },
    ]}
    data={longData}
    enableBottomToolbar={false}
    enablePagination={false}
    enableRowNumbers
    enableRowVirtualization
    enableStickyFooter
  />
);

export const EnableColumnVirtualization = () => (
  <MaterialReactTable
    columns={longColumns}
    data={longData.slice(0, 10)}
    enableColumnVirtualization
    enableRowNumbers
  />
);

export const EnableColumnVirtualizationWithPinning = () => (
  <MaterialReactTable
    columns={longColumns}
    data={longData.slice(0, 10)}
    enableColumnPinning
    enableColumnVirtualization
    enableRowNumbers
  />
);

export const EnableColumnVirtualizationShortColumns = () => (
  <MaterialReactTable
    columns={longColumns.slice(0, 3)}
    data={longData.slice(0, 10)}
    enableColumnVirtualization
    enableRowNumbers
  />
);

export const EnableColumnVirtualizationWithFooter = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'firstName',
        footer: 'First Name',
        header: 'First Name',
        type: 'string',
      },
      {
        accessorKey: 'middleName',
        footer: 'Middle Name',
        header: 'Middle Name',
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        footer: 'Last Name',
        header: 'Last Name',
        type: 'string',
      },
    ]}
    data={longData.slice(0, 15)}
    enableColumnVirtualization
    enableRowNumbers
  />
);

export const EnableColumnVirtualizationStickyFooter = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'firstName',
        footer: 'First Name',
        header: 'First Name',
        type: 'string',
      },
      {
        accessorKey: 'middleName',
        footer: 'Middle Name',
        header: 'Middle Name',
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        footer: 'Last Name',
        header: 'Last Name',
        type: 'string',
      },
    ]}
    data={longData.slice(0, 50)}
    enableColumnVirtualization
    enableRowNumbers
    enableStickyFooter
  />
);

export const RowAndColumnVirtualization = () => (
  <MaterialReactTable
    columns={longColumns}
    data={longData}
    enableBottomToolbar={false}
    enableColumnVirtualization
    enablePagination={false}
    enableRowNumbers
    enableRowVirtualization
  />
);

export const RowAndColumnVirtualizationWithFeatures = () => (
  <MaterialReactTable
    columns={longColumns}
    data={longData}
    enableBottomToolbar={false}
    enableColumnOrdering
    enableColumnPinning
    enableColumnResizing
    enableColumnVirtualization
    enablePagination={false}
    enableRowNumbers
    enableRowSelection
    enableRowVirtualization
  />
);

const fakeColumns = [...Array(500)].map((_, i) => {
  return {
    accessorKey: i.toString(),
    header: 'Column ' + i.toString(),
    type: 'string',
  };
});

const fakeData = [...Array(500)].map(() => ({
  ...Object.fromEntries(
    fakeColumns.map((col) => [col.accessorKey, faker.person.firstName()]),
  ),
}));

export const MaxVirtualization = () => (
  <MaterialReactTable
    columns={fakeColumns}
    data={fakeData}
    enableBottomToolbar={false}
    enableColumnPinning
    enableColumnResizing
    enableColumnVirtualization
    enablePagination={false}
    enableRowNumbers
    enableRowVirtualization
    muiTableContainerProps={{ sx: { maxHeight: 500 } }}
    muiTablePaperProps={{ sx: { m: 'auto', maxWidth: 1000 } }}
  />
);

export const EmptyDataVirtualization = () => (
  <MaterialReactTable
    columns={fakeColumns}
    data={[]}
    enableBottomToolbar={false}
    enableColumnPinning
    enableColumnResizing
    enableColumnVirtualization
    enablePagination={false}
    enableRowNumbers
    enableRowVirtualization
    muiTableContainerProps={{ sx: { maxHeight: 500 } }}
    muiTablePaperProps={{ sx: { margin: 'auto', maxWidth: 1000 } }}
  />
);
