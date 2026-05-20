import { type MRT_ColumnDef, MaterialReactTable } from '../../src';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Features/Column Dragging Examples',
};

export default meta;

type Person = {
  address: string;
  city: string;
  email: string;
  firstName: string;
  lastName: string;
  state: string;
};

const columns: MRT_ColumnDef<Person>[] = [
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

export const ColumnDraggingEnabled = () => (
  <MaterialReactTable columns={columns} data={data} enableColumnDragging />
);

export const ColumnDraggingDisabledPerColumn = () => (
  <MaterialReactTable
    columns={[
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
        enableColumnDragging: false,
        header: 'State',
        type: 'string',
      },
    ]}
    data={data}
    enableColumnDragging
  />
);
