import { useState } from 'react';
import Button from '@mui/material/Button';
import { type MRT_ColumnDef, MaterialReactTable } from '../../src';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Features/Row Number Examples',
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
    accessorKey: 'address',
    header: 'Address',
    type: 'string',
  },
  {
    accessorKey: 'state',
    header: 'State',
    type: 'string',
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone Number',
    type: 'string',
  },
];

const data = [...Array(100)].map(() => ({
  address: faker.location.streetAddress(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  phoneNumber: faker.phone.number(),
  state: faker.location.state(),
}));

export const EnableRowNumbersStatic = () => (
  <MaterialReactTable columns={columns} data={data} enableRowNumbers />
);

export const EnableRowNumbersConditionally = () => {
  const [enableRowNumbers, setEnableRowNumbers] = useState(false);
  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      enableRowNumbers={enableRowNumbers}
      renderTopToolbarCustomActions={() => (
        <Button onClick={() => setEnableRowNumbers(!enableRowNumbers)}>
          Toggle Row Numbers
        </Button>
      )}
    />
  );
};

export const EnableRowNumbersStaticGrid = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableRowNumbers
    layoutMode="grid"
  />
);

export const EnableRowNumbersStaticGridNoGrow = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableRowNumbers
    layoutMode="grid-no-grow"
  />
);

export const EnableRowNumbersOriginal = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableRowNumbers
    enableRowVirtualization
    rowNumberDisplayMode="original"
  />
);

export const EnableRowNumbersOriginalVirtual = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableBottomToolbar={false}
    enablePagination={false}
    enableRowNumbers
    rowNumberDisplayMode="original"
  />
);

export const EnableRowNumbersStaticVirtual = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableBottomToolbar={false}
    enablePagination={false}
    enableRowNumbers
    enableRowVirtualization
    rowNumberDisplayMode="static"
  />
);
