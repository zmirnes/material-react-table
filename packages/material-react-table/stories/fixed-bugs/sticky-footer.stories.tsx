import { type MRT_ColumnDef, MaterialReactTable } from '../../src';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Fixed Bugs/sticky-footer',
};

export default meta;

const mockData = [
  {
    firstName: 'Michael',
    lastName: 'Jordan',
    middleName: 'Jeffrey',
    name: 'Michael Jeffrey Jordan',
    no: 23,
    salary: 1030000,
    total: 86760000,
  },
  {
    firstName: 'Kobe',
    lastName: 'Bryant',
    middleName: 'Bean',
    name: 'Kobe Bean Bryant',
    no: 24,
    salary: 25000000,
    total: 328237108,
  },
  {
    firstName: 'LeBron',
    lastName: 'James',
    middleName: 'Raymone',
    name: 'LeBron Raymone James',
    no: 6,
    salary: 44474988,
    total: 431859107,
  },
  {
    firstName: 'Michael',
    lastName: 'Jordan',
    middleName: 'Jeffrey',
    name: 'Michael Jeffrey Jordan',
    no: 23,
    salary: 1030000,
    total: 86760000,
  },
  {
    firstName: 'Kobe',
    lastName: 'Bryant',
    middleName: 'Bean',
    name: 'Kobe Bean Bryant',
    no: 24,
    salary: 25000000,
    total: 328237108,
  },
  {
    firstName: 'LeBron',
    lastName: 'James',
    middleName: 'Raymone',
    name: 'LeBron Raymone James',
    no: 6,
    salary: 44474988,
    total: 431859107,
  },
  {
    firstName: 'Michael',
    lastName: 'Jordan',
    middleName: 'Jeffrey',
    name: 'Michael Jeffrey Jordan',
    no: 23,
    salary: 1030000,
    total: 86760000,
  },
  {
    firstName: 'Kobe',
    lastName: 'Bryant',
    middleName: 'Bean',
    name: 'Kobe Bean Bryant',
    no: 24,
    salary: 25000000,
    total: 328237108,
  },
  {
    firstName: 'LeBron',
    lastName: 'James',
    middleName: 'Raymone',
    name: 'LeBron Raymone James',
    no: 6,
    salary: 44474988,
    total: 431859107,
  },
];

const mockColumns: MRT_ColumnDef<(typeof mockData)[0]>[] = [
  {
    accessorKey: 'no',
    filterVariant: 'multi-select',
    footer: 'SUM',
    header: 'No. ',
    size: 80,
    type: 'number',
  },
  {
    accessorKey: 'name',
    header: 'NAME',
    size: 190,
    type: 'string',
  },
  {
    accessorKey: 'firstName',
    header: 'FIRST NAME',
    type: 'string',
  },
  {
    accessorKey: 'middleName',
    header: 'MIDDLE NAME',
    size: 150,
    type: 'string',
  },
  {
    accessorKey: 'lastName',
    header: 'LAST NAME',
    type: 'string',
  },
  {
    accessorKey: 'salary',
    footer: '211514964',
    header: 'SALARY',
    type: 'number',
  },
  {
    accessorKey: 'total',
    footer: '2540568645',
    header: 'TOTAL',
    type: 'number',
  },
];

export const PinnedColumnsWithStickyFooter = () => {
  return (
    <MaterialReactTable
      columns={mockColumns}
      data={mockData}
      enableColumnPinning
      enableStickyFooter
      enableStickyHeader
      initialState={{ columnPinning: { left: ['no', 'name', 'firstName'] } }}
      muiTableBodyCellProps={{
        align: 'center',
        sx: { borderLeft: '1px solid black' },
      }}
      muiTableContainerProps={{
        sx: { maxHeight: 300 },
      }}
      muiTableHeadCellProps={{
        align: 'center',
        sx: { borderLeft: '1px solid black' },
      }}
    />
  );
};
