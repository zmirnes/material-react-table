import { type MRT_ColumnDef, MaterialReactTable } from '../../src';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  parameters: {
    status: {
      type: 'stable',
    },
  },
  title: 'Styling/Sticky Header Examples',
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

export const StickyHeaderDisabledDefault = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    initialState={{ pagination: { pageIndex: 0, pageSize: 25 } }}
  />
);

export const EnableStickyHeader = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableStickyHeader
    initialState={{ pagination: { pageIndex: 0, pageSize: 25 } }}
  />
);

export const StickyHeaderShorterTable = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableColumnPinning
    enableRowSelection
    enableStickyHeader
    initialState={{ pagination: { pageIndex: 0, pageSize: 25 } }}
    muiTableContainerProps={{ sx: { maxHeight: 400 } }}
  />
);

const columnsWithFooters: MRT_ColumnDef<(typeof data)[0]>[] = [
  {
    accessorKey: 'firstName',
    footer: 'First Name',
    header: 'First Name',
    type: 'string',
  },
  {
    accessorKey: 'lastName',
    footer: 'Last Name',
    header: 'Last Name',
    type: 'string',
  },
  {
    accessorKey: 'address',
    footer: 'Address',
    header: 'Address',
    type: 'string',
  },
  {
    accessorKey: 'state',
    footer: 'State',
    header: 'State',
    type: 'string',
  },
  {
    accessorKey: 'phoneNumber',
    footer: 'Phone Number',
    header: 'Phone Number',
    type: 'string',
  },
];

export const DisableStickyFooter = () => (
  <MaterialReactTable
    columns={columnsWithFooters}
    data={data}
    enableRowNumbers
    enableStickyFooter={false}
    enableStickyHeader
    initialState={{ pagination: { pageIndex: 0, pageSize: 25 } }}
    muiTableContainerProps={{ sx: { maxHeight: 400 } }}
  />
);

export const EnableStickyFooter = () => (
  <MaterialReactTable
    columns={columnsWithFooters}
    data={data}
    enableRowNumbers
    enableStickyFooter
    enableStickyHeader
    initialState={{ pagination: { pageIndex: 0, pageSize: 25 } }}
    muiTableContainerProps={{ sx: { maxHeight: 400 } }}
  />
);
