import {
  type MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable,
} from '../../src';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Features/Click to Copy Examples',
};

export default meta;

type Person = {
  address: string;
  city: string;
  email: string;
  name: {
    firstName: string;
    lastName: string;
  };
  state: string;
};

const columns: MRT_ColumnDef<Person>[] = [
  {
    accessorKey: 'name.firstName',
    header: 'First Name',
    type: 'string',
  },
  {
    accessorKey: 'name.lastName',
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

const data: Person[] = [...Array(100)].map(() => ({
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  email: faker.internet.email(),
  name: {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  },
  state: faker.location.state(),
}));

export const ClickToCopyEnabled = () => {
  const table = useMaterialReactTable({
    columns,
    data,
    enableClickToCopy: true,
  });
  return <MaterialReactTable table={table} />;
};

export const ClickToCopyEnabledWithColumnResizing = () => {
  const table = useMaterialReactTable({
    columns,
    data,
    enableClickToCopy: true,
    enableColumnResizing: true,
  });

  return <MaterialReactTable table={table} />;
};

export const ClickToCopyEnabledPerColumn = () => {
  const table = useMaterialReactTable({
    columns: [
      {
        accessorKey: 'name.firstName',
        header: 'First Name',
        type: 'string',
      },
      {
        accessorKey: 'name.lastName',
        header: 'Last Name',
        type: 'string',
      },
      {
        accessorKey: 'email',
        enableClickToCopy: true,
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
    ],
    data,
  });

  return <MaterialReactTable table={table} />;
};

export const ClickToCopyDisabledPerColumn = () => {
  const table = useMaterialReactTable({
    columns: [
      {
        accessorKey: 'name.firstName',
        header: 'First Name',
        type: 'string',
      },
      {
        accessorKey: 'name.lastName',
        header: 'Last Name',
        type: 'string',
      },
      {
        accessorKey: 'email',
        enableClickToCopy: false,
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
    ],
    data,
  });

  return <MaterialReactTable table={table} />;
};
