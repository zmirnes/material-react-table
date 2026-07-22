import { type MRT_ColumnDef, MaterialReactTable } from '../../src';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Features/Column Pinning Examples',
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
    accessorKey: 'email',
    header: 'Email Address',
    type: 'string',
  },
  {
    accessorKey: 'address',
    header: 'Address',
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
];

const data = [...Array(100)].map(() => ({
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  state: faker.location.state(),
}));

export const ColumnPinningEnabled = () => (
  <MaterialReactTable columns={columns} data={data} enableColumnPinning />
);

export const ColumnPinningInitial = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableColumnPinning
    initialState={{ columnPinning: { start: ['email'], end: ['state'] } }}
  />
);

export const ColumnPinningDisabledPerColumn = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'firstName',
        enablePinning: false,
        header: 'First Name',
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
        type: 'string',
      },
      {
        accessorKey: 'address',
        header: 'Address',
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
    ]}
    data={data}
    enableColumnPinning
  />
);

export const ColumnPinningWithSelect = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableColumnPinning
    enableRowSelection
  />
);

export const ColumnPinningWithDetailPanel = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableColumnPinning
    enableExpanding
    renderDetailPanel={({ row: _row }) => <h1>Hi</h1>}
  />
);
