import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { type MRT_ColumnDef, MaterialReactTable } from '../../src';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Features/Column Action Examples',
};

export default meta;

type Row = {
  address: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  state: string;
};

const columns: MRT_ColumnDef<Row>[] = [
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

const data: Row[] = [...Array(100)].map(() => ({
  address: faker.location.streetAddress(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  phoneNumber: faker.phone.number(),
  state: faker.location.state(),
}));

export const ColumnActionsEnabledDefault = () => (
  <MaterialReactTable columns={columns} data={data} />
);

export const ColumnActionsDisabled = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableColumnActions={false}
  />
);

export const ColumnActionsDisabledPerColumn = () => (
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
        accessorKey: 'address',
        enableColumnActions: false,
        header: 'Address',
        type: 'string',
      },
      {
        accessorKey: 'state',
        enableColumnActions: false,
        header: 'State',
        type: 'string',
      },
      {
        accessorKey: 'phoneNumber',
        enableColumnActions: false,
        header: 'Phone Number',
        type: 'string',
      },
    ]}
    data={data}
  />
);

export const ColumnActionsEnabledPerColumn = () => (
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
        accessorKey: 'address',
        enableColumnActions: true,
        header: 'Address',
        type: 'string',
      },
      {
        accessorKey: 'state',
        enableColumnActions: true,
        header: 'State',
        type: 'string',
      },
      {
        accessorKey: 'phoneNumber',
        enableColumnActions: true,
        header: 'Phone Number',
        type: 'string',
      },
    ]}
    data={data}
    enableColumnActions={false}
  />
);

export const CustomColumnActions = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    renderColumnActionsMenuItems={() => [
      <MenuItem key={1}>Item 1</MenuItem>,
      <MenuItem key={2}>Item 2</MenuItem>,
    ]}
  />
);

export const CustomColumnActionsPerColumn = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'firstName',
        header: 'First Name',
        renderColumnActionsMenuItems: () => [
          <MenuItem key={1}>Item 1</MenuItem>,
          <MenuItem key={2}>Item 2</MenuItem>,
        ],
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        renderColumnActionsMenuItems: () => [
          <MenuItem key={1}>Item 2</MenuItem>,
          <MenuItem key={3}>Item 3</MenuItem>,
        ],
        type: 'string',
      },
      {
        accessorKey: 'address',
        enableColumnActions: true,
        header: 'Address',
        renderColumnActionsMenuItems: ({ internalColumnMenuItems }) => [
          ...internalColumnMenuItems,
          <Divider key={3332} />,
          <MenuItem key={3333}>Item 1</MenuItem>,
          <MenuItem key={3334}>Item 2</MenuItem>,
        ],
        type: 'string',
      },
      {
        accessorKey: 'state',
        enableColumnActions: true,
        header: 'State',
        type: 'string',
      },
      {
        accessorKey: 'phoneNumber',
        enableColumnActions: true,
        header: 'Phone Number',
        type: 'string',
      },
    ]}
    data={data}
  />
);
