import { MaterialReactTable, type MRT_ColumnDef } from '../../src';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Features/Column Hiding Examples',
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
    accessorKey: 'zip',
    header: 'Zip',
    type: 'string',
  },
  {
    accessorKey: 'email',
    header: 'Email Address',
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
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  phoneNumber: faker.phone.number(),
  state: faker.location.state(),
  zip: faker.location.zipCode(),
}));

export const ColumnHidingEnabledDefault = () => (
  <MaterialReactTable columns={columns} data={data} />
);

export const ColumnHidingDisabled = () => (
  <MaterialReactTable columns={columns} data={data} enableHiding={false} />
);

export const ColumnHidingDisabledButWithOrdering = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableColumnOrdering
    enableHiding={false}
  />
);

export const ColumnHidingDisabledButWithPinning = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableColumnPinning
    enableHiding={false}
  />
);

export const ColumnHidingDisabledPerColumn = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'firstName',
        enableHiding: false,
        header: 'First Name',
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        enableHiding: false,
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
        accessorKey: 'zip',
        header: 'Zip',
        type: 'string',
      },
      {
        accessorKey: 'email',
        header: 'Email Address',
        type: 'string',
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone Number',
        type: 'string',
      },
    ]}
    data={data}
  />
);

export const ColumnHidingWithHeaderGroups = () => (
  <MaterialReactTable
    columns={[
      {
        columns: [
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
        ],
        header: 'Name',
        id: 'name',
        type: 'string',
      },
      {
        columns: [
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
            accessorKey: 'zip',
            header: 'Zip',
            type: 'string',
          },
        ],
        header: 'Mailing Info',
        id: 'mailingInfo',
        type: 'string',
      },
      {
        columns: [
          {
            accessorKey: 'email',
            header: 'Email Address',
            type: 'string',
          },
          {
            accessorKey: 'phoneNumber',
            header: 'Phone Number',
            type: 'string',
          },
        ],
        header: 'Contact Info',
        id: 'contactInfo',
        type: 'string',
      },
    ]}
    data={data}
  />
);
export const ColumnHidingColumnsNotVisibleInShowHide = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'firstName',
        header: 'First Name',
        visibleInShowHideMenu: false,
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        type: 'string',
        visibleInShowHideMenu: false,
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
        accessorKey: 'zip',
        header: 'Zip',
        type: 'string',
      },
      {
        accessorKey: 'email',
        header: 'Email Address',
        type: 'string',
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone Number',
        type: 'string',
      },
    ]}
    data={data}
  />
);
export const ColumnHidingWithColumnsHiddenAndNotVisibleInShowHide = () => (
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
        enableHiding: false,
        header: 'Address',
        visibleInShowHideMenu: false,
        type: 'string',
      },
      {
        accessorKey: 'state',
        header: 'State',
        type: 'string',
      },
      {
        accessorKey: 'zip',
        header: 'Zip',
        type: 'string',
      },
      {
        accessorKey: 'email',
        header: 'Email Address',
        type: 'string',
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone Number',
        type: 'string',
      },
    ]}
    data={data}
    initialState={{
      columnVisibility: { address: false },
    }}
  />
);
