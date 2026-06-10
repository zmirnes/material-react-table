import { useMemo } from 'react';
import { type MRT_ColumnDef, MaterialReactTable } from '../../src';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Fixed Bugs/Loading Data',
};

export default meta;

type Person = {
  address: string;
  city: string;
  name: {
    firstName: string;
    lastName: string;
  };
  state: string;
};

export const NestedLoadingDataWithInitialExpanded = () => {
  const columns = useMemo<MRT_ColumnDef<Person>[]>(
    () => [
      //column definitions...
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
      //end
    ],
    [],
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={[]}
      state={{
        expanded: true,
        isLoading: true,
      }}
    />
  );
};

export const NestedLoadingDataWithInitialFilter = () => {
  const columns = useMemo<MRT_ColumnDef<Person>[]>(
    () => [
      //column definitions...
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
      //end
    ],
    [],
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={[]}
      state={{
        columnFilters: [{ id: 'name.firstName', value: 'Branson' }],
        isLoading: true,
      }}
    />
  );
};

export const NestedLoadingDataWithInitialGroup = () => {
  const columns = useMemo<MRT_ColumnDef<Person>[]>(
    () => [
      //column definitions...
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
      //end
    ],
    [],
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={[]}
      state={{
        grouping: ['name.firstName'],
        isLoading: true,
      }}
    />
  );
};

export const NestedLoadingDataWithInitialPage = () => {
  const columns = useMemo<MRT_ColumnDef<Person>[]>(
    () => [
      //column definitions...
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
      //end
    ],
    [],
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={[]}
      state={{
        isLoading: true,
        pagination: { pageIndex: 2, pageSize: 5 },
      }}
    />
  );
};

export const NestedLoadingDataWithInitialSort = () => {
  const columns = useMemo<MRT_ColumnDef<Person>[]>(
    () => [
      //column definitions...
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
      //end
    ],
    [],
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={[]}
      state={{
        isLoading: true,
        sorting: [{ desc: false, id: 'name.lastName' }],
      }}
    />
  );
};

export const AccessorKeyWhileLoading = () => {
  const columns = useMemo<MRT_ColumnDef<Person>[]>(
    //column definitions...
    () => [
      {
        Cell: ({ row }) =>
          `${row.original.name.firstName.toUpperCase()} ${row.original.name.lastName.toUpperCase()}`,
        accessorKey: 'name',
        header: 'Name',
        id: 'name',
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
    [],
    //end
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={[]}
      state={{ isLoading: true }}
    />
  );
};
