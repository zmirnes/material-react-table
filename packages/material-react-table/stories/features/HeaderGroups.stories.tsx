import { MaterialReactTable, type MRT_ColumnDef } from '../../src';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Features/Header Groups Examples',
};

export default meta;

const columns: MRT_ColumnDef<(typeof data)[0]>[] = [
  {
    accessorKey: 'name',
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
    accessorKey: 'info',
    columns: [
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
    ],
    header: 'Info',
    id: 'info',
    type: 'string',
  },
];

const data = [...Array(555)].map(() => ({
  address: faker.location.streetAddress(),
  age: faker.number.int(80),
  city: faker.location.city(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  state: faker.location.state(),
}));

export const HeaderGroups = () => (
  <MaterialReactTable columns={columns} data={data} />
);

export const HeaderGroupsWithStickyHeader = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableStickyHeader
    initialState={{ pagination: { pageIndex: 0, pageSize: 25 } }}
  />
);

export const HeaderAndFooterGroups = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'name',
        columns: [
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
        ],
        footer: 'Name',
        header: 'Name',
        id: 'name',
        type: 'string',
      },
      {
        accessorKey: 'info',
        columns: [
          {
            accessorKey: 'age',
            footer: 'Age',
            header: 'Age',
            type: 'number',
          },
          {
            accessorKey: 'address',
            footer: 'Address',
            header: 'Address',
            type: 'string',
          },
        ],
        footer: 'Info',
        header: 'Info',
        id: 'info',
        type: 'string',
      },
    ]}
    data={data}
    enableColumnPinning
  />
);

export const HeaderGroupsWithColumnOrdering = () => (
  <MaterialReactTable columns={columns} data={data} enableColumnOrdering />
);

export const HeaderGroupsWithColumnPinning = () => (
  <MaterialReactTable columns={columns} data={data} enableColumnPinning />
);

export const HeaderGroupsWithColumResizing = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableColumnResizing
    enableRowSelection
  />
);

export const HeaderGroupsWithColumResizingGrid = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableColumnResizing
    layoutMode="grid"
  />
);

export const HeaderGroupsWithSemanticColumResizing = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableColumnResizing
    layoutMode="semantic"
  />
);

export const MixedHeaderGroups = () => {
  return (
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
          accessorKey: 'age',
          columns: [
            {
              accessorKey: 'address',
              header: 'Address',
              type: 'string',
            },
          ],
          header: 'Grouped',
          id: 'grouped',
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
    />
  );
};

export const DeepMixedHeaderGroups = () => {
  return (
    <MaterialReactTable
      columns={[
        {
          accessorKey: 'firstName',
          header: 'First Name',
          type: 'string',
        },
        {
          accessorKey: 'address',
          columns: [
            {
              accessorKey: 'city',
              columns: [
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
              header: 'Location',
              id: 'location',
              type: 'string',
            },
          ],
          header: 'Grouped',
          id: 'grouped',
          type: 'string',
        },
        {
          accessorKey: 'lastName',
          header: 'Last Name',
          type: 'string',
        },
      ]}
      data={data}
    />
  );
};

export const HeaderGroupsWithRowVirtualization = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enablePagination={false}
    enableRowVirtualization
  />
);

export const HeaderGroupsWithColumnVirtualization = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableColumnVirtualization
  />
);
