import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
} from '../../src';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Features/Filtering Examples',
};

export default meta;

const columns: MRT_ColumnDef<(typeof data)[0]>[] = [
  {
    Cell: ({ cell }) => (cell.getValue() ? 'Yes' : 'No'),
    accessorKey: 'isActive',
    header: 'Is Active',
    size: 110,
    type: 'boolean',
  },
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
    filterVariant: 'range',
    header: 'Age',
    type: 'number',
  },
  {
    Cell: ({ cell }) => cell.getValue<Date>().toLocaleDateString(), //transform data to readable format for cell render
    accessorKey: 'birthDate',
    filterFn: 'lessThan',
    filterVariant: 'date',
    header: 'Birth Date',
    id: 'birthDate',
    type: 'date',
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    type: 'string',
  },
  {
    accessorKey: 'address',
    header: 'Address',
    type: 'string',
  },
  {
    accessorKey: 'state',
    filterSelectOptions: [
      { label: 'AL', value: 'Alabama' },
      { label: 'AZ', value: 'Arizona' },
      { label: 'CA', value: 'California' },
      { label: 'FL', value: 'Florida' },
      { label: 'GA', value: 'Georgia' },
      { label: 'NY', value: 'New York' },
      { label: 'TX', value: 'Texas' },
    ],
    filterVariant: 'multi-select',
    header: 'State',
    type: 'string',
  },
];

const data = [...Array(120)].map(() => ({
  address: faker.location.streetAddress(),
  age: faker.number.int(100),
  arrivalTime: faker.date.recent(),
  birthDate: faker.date.birthdate({ max: 2020, min: 1980, mode: 'age' }),
  departureTime: faker.date.recent(),
  firstName: faker.person.firstName(),
  gender: Math.random() < 0.8 ? faker.person.sex() : faker.person.gender(),
  hireDate: faker.date.birthdate({ max: 2024, min: 2011, mode: 'age' }),
  isActive: faker.datatype.boolean(),
  lastName: faker.person.lastName(),
  state: faker.location.state(),
}));

export const FilteringEnabledDefault = () => (
  <MaterialReactTable columns={columns} data={data} />
);

export const PopoverDisplayMode = () => (
  <MaterialReactTable
    columnFilterDisplayMode="popover"
    columns={columns}
    data={data}
  />
);

export const PopoverDisplayModeNoSorting = () => (
  <MaterialReactTable
    columnFilterDisplayMode="popover"
    columns={columns}
    data={data}
    enableSorting={false}
  />
);

export const ColumnFilteringDisabled = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableColumnFilters={false}
  />
);

export const FilteringDisabled = () => (
  <MaterialReactTable columns={columns} data={data} enableFilters={false} />
);

export const FilterHighlightingDisabled = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableFilterMatchHighlighting={false}
  />
);

export const FilterFnAndFilterVariants = () => (
  <MaterialReactTable
    columns={[
      {
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Yes' : 'No'),
        accessorKey: 'isActive',
        filterVariant: 'checkbox',
        header: 'Is Active',
        id: 'isActive',
        size: 200,
        type: 'boolean',
      },
      {
        accessorKey: 'firstName',
        filterFn: 'fuzzy', // default
        header: 'First Name',
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        filterFn: 'contains',
        header: 'Last Name',
        type: 'string',
      },
      {
        accessorKey: 'age',
        filterVariant: 'range',
        header: 'Age',
        type: 'number',
      },
      {
        Cell: ({ cell }) => cell.getValue<Date>().toLocaleDateString(), //transform data to readable format for cell render
        accessorKey: 'birthDate',
        filterFn: 'lessThan',
        filterVariant: 'date',
        header: 'Birth Date',
        id: 'birthDate',
        type: 'date',
      },
      {
        Cell: ({ cell }) => cell.getValue<Date>().toLocaleDateString(), //transform data to readable format for cell render
        accessorKey: 'hireDate',
        filterVariant: 'date-range',
        header: 'Hire Date',
        id: 'hireDate',
        type: 'date',
      },
      {
        Cell: ({ cell }) => cell.getValue<Date>().toLocaleString(), //transform data to readable format for cell render
        accessorKey: 'arrivalTime',
        filterVariant: 'datetime-range',
        header: 'Arrival time',
        id: 'arrivalTime',
        type: 'dateTime',
      },
      {
        Cell: ({ cell }) => cell.getValue<Date>().toLocaleString(), //transform data to readable format for cell render
        accessorKey: 'departureTime',
        filterVariant: 'time-range',
        header: 'Departure Time',
        id: 'departureTime',
        type: 'dateTime',
      },
      {
        accessorKey: 'gender',
        filterSelectOptions: ['Male', 'Female', 'Other'],
        filterVariant: 'select',
        header: 'Gender',
        type: 'string',
      },
      {
        accessorKey: 'address',
        filterFn: 'includesStringSensitive',
        header: 'Address',
        type: 'string',
      },
      {
        accessorKey: 'state',
        filterSelectOptions: [
          { label: 'AL', value: 'Alabama' },
          { label: 'AZ', value: 'Arizona' },
          { label: 'CA', value: 'California' },
          { label: 'FL', value: 'Florida' },
          { label: 'GA', value: 'Georgia' },
          { label: 'NY', value: 'New York' },
          { label: 'TX', value: 'Texas' },
        ],
        filterVariant: 'multi-select',
        header: 'State',
        type: 'string',
      },
    ]}
    data={data}
    initialState={{ showColumnFilters: true }}
  />
);

export const FilterFnAndFilterVariantsFaceted = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'firstName',
        filterSelectOptions: data.map((row) => ({
          label: row.firstName.toUpperCase().split('').reverse().join(''),
          value: row.firstName,
        })), //hard coded
        filterVariant: 'autocomplete',
        header: 'First Name',
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        filterVariant: 'autocomplete', //faceted auto generated select options
        header: 'Last Name',
        type: 'string',
      },
      {
        accessorKey: 'age',
        filterVariant: 'range-slider',
        header: 'Age',
        type: 'number',
      },
      {
        accessorKey: 'gender',
        filterVariant: 'select',
        header: 'Gender',
        type: 'string',
      },
      {
        accessorKey: 'state',
        filterVariant: 'multi-select',
        header: 'State',
        type: 'string',
      },
    ]}
    data={data}
    enableFacetedValues
    initialState={{ showColumnFilters: true }}
  />
);

export const FilteringChangeModeEnabled = () => (
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
        filterFn: 'between',
        header: 'Age',
        type: 'number',
      },
      {
        Cell: ({ cell }) => cell.getValue<Date>().toLocaleDateString(), //transform data to readable format for cell render
        accessorKey: 'birthDate',
        filterVariant: 'date',
        header: 'Birth Date',
        id: 'birthDate',
        type: 'date',
      },
      {
        accessorKey: 'gender',
        filterSelectOptions: ['Male', 'Female', 'Other'],
        header: 'Gender',
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
    ]}
    data={data}
    enableColumnFilterModes
    initialState={{ showColumnFilters: true }}
  />
);

export const FilteringChangeModeEnabledFaceted = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'firstName',
        filterFn: 'fuzzy', // default
        header: 'First Name',
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        filterVariant: 'autocomplete',
        header: 'Last Name',
        type: 'string',
      },
      {
        accessorKey: 'age',
        filterVariant: 'range-slider',
        header: 'Age',
        type: 'number',
      },
      {
        accessorKey: 'gender',
        filterVariant: 'select',
        header: 'Gender',
        type: 'string',
      },
      {
        accessorKey: 'state',
        filterVariant: 'multi-select',
        header: 'State',
        type: 'string',
      },
    ]}
    data={data}
    enableColumnFilterModes
    enableFacetedValues
    initialState={{ showColumnFilters: true }}
  />
);

export const FilteringChangeModeEnabledHidden = () => (
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
        filterFn: 'between',
        header: 'Age',
        type: 'number',
      },
      {
        accessorKey: 'gender',
        filterSelectOptions: ['Male', 'Female', 'Other'],
        header: 'Gender',
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
    ]}
    data={data}
    enableColumnFilterModes
  />
);

export const DisableSomeFilterTypesForCertainColumns = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'firstName',
        header: 'First Name',
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        columnFilterModeOptions: [
          'startsWith',
          'endsWith',
          'empty',
          'notEmpty',
        ],
        filterFn: 'startsWith',
        header: 'Last Name',
        type: 'string',
      },
      {
        accessorKey: 'age',
        header: 'Age',
        type: 'number',
      },
      {
        accessorKey: 'gender',
        columnFilterModeOptions: ['equals', 'notEquals'],
        filterFn: 'equals',
        header: 'Gender',
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
    ]}
    data={data}
    enableColumnFilterModes
    initialState={{ showColumnFilters: true }}
  />
);

export const FilteringDisabledForCertainColumns = () => (
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
        enableColumnFilter: false,
        header: 'Age',
        type: 'number',
      },
      {
        accessorKey: 'gender',
        header: 'Gender',
        type: 'string',
      },
      {
        accessorKey: 'address',
        enableColumnFilter: false,
        header: 'Address',
        type: 'string',
      },
      {
        accessorKey: 'state',
        header: 'State',
        type: 'string',
      },
    ]}
    data={data}
    initialState={{ showColumnFilters: true }}
  />
);

export const CustomFilterFunctionPerColumn = () => (
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
        header: 'Age',
        type: 'number',
      },
      {
        accessorKey: 'gender',
        filterFn: (row, _columnIds, filterValue) =>
          row
            .getValue<string>('gender')
            .toLowerCase()
            .startsWith(filterValue.toLowerCase()),
        header: 'Gender',
        type: 'string',
      },
      {
        accessorKey: 'address',
        header: 'Address',
        type: 'string',
      },
      {
        accessorKey: 'state',
        filterFn: (row, _columnIds, filterValue) =>
          row
            .getValue<string>('state')
            .toLowerCase()
            .startsWith(filterValue.toLowerCase()),
        header: 'State',
        type: 'string',
      },
    ]}
    data={data}
    initialState={{ showColumnFilters: true }}
  />
);

export const CustomFilterFns = () => (
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
        header: 'Age',
        type: 'number',
      },
      {
        accessorKey: 'gender',
        filterFn: 'customFn',
        header: 'Gender',
        type: 'string',
      },
      {
        accessorKey: 'address',
        header: 'Address',
        type: 'string',
      },
      {
        accessorKey: 'state',
        filterFn: 'customFn',
        header: 'State',
        type: 'string',
      },
    ]}
    data={data}
    filterFns={{
      customFn: (row, _columnIds, filterValue) => {
        console.info('customFn', row, _columnIds, filterValue);
        return row
          .getValue<string>('state')
          .toLowerCase()
          .startsWith(filterValue.toLowerCase());
      },
    }}
    initialState={{ showColumnFilters: true }}
  />
);

export const CustomFilterComponent = () => (
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
        header: 'Age',
        type: 'number',
      },
      {
        Filter: ({ header }) => (
          <TextField
            fullWidth
            margin="none"
            onChange={(e) =>
              header.column.setFilterValue(e.target.value || undefined)
            }
            placeholder="Filter"
            select
            value={header.column.getFilterValue() ?? ''}
            variant="standard"
          >
            {/*@ts-expect-error*/}
            <MenuItem value={null}>All</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
        ),
        accessorKey: 'gender',
        filterFn: (row, _columnIds, filterValue) =>
          row.getValue<string>('gender').toLowerCase() ===
          filterValue.toLowerCase(),
        header: 'Gender',
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
    ]}
    data={data}
    initialState={{ showColumnFilters: true }}
  />
);

export const CustomizeFilterTextFields = () => (
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
        header: 'Age',
        type: 'number',
      },
      {
        accessorKey: 'gender',
        filterSelectOptions: ['Male', 'Female', 'Other'],
        filterVariant: 'select',
        header: 'Gender',
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
    ]}
    data={data}
    initialState={{ showColumnFilters: true }}
    muiFilterTextFieldProps={{ variant: 'outlined' }}
  />
);

export const ManualFiltering = () => {
  const [rows, setRows] = useState(() => [...data]);
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    [],
  );

  //this kind of logic would actually live on a server, not client-side
  useEffect(() => {
    if (columnFilters?.length) {
      let filteredRows = [...data];
      columnFilters.map((filter) => {
        const { id: columnId, value: filterValue } = filter;
        filteredRows = filteredRows.filter((row) => {
          return row[columnId as keyof typeof row]
            ?.toString()
            ?.toLowerCase()
            ?.includes?.((filterValue as string).toLowerCase());
        });
      });
      setRows(filteredRows);
    } else {
      setRows([...data]);
    }
  }, [columnFilters]);

  return (
    <MaterialReactTable
      columnFilterModeOptions={null}
      columns={columns}
      data={rows}
      manualFiltering
      onColumnFiltersChange={setColumnFilters}
      state={{ columnFilters }}
    />
  );
};

export const ExternalSetFilterValue = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    initialState={{ showColumnFilters: true }}
    renderTopToolbarCustomActions={({ table }) => (
      <Box>
        <Button
          onClick={() =>
            table.setColumnFilters((prev) => [
              ...prev,
              { id: 'firstName', value: 'Joe' },
            ])
          }
        >
          Find Joes
        </Button>
        <Button
          onClick={() =>
            table.setColumnFilters((prev) => [
              ...prev,
              { id: 'age', value: [18, 25] },
            ])
          }
        >
          Find 18-25 Age Range
        </Button>
        <Button onClick={() => table.resetColumnFilters()}>
          Reset Filters
        </Button>
      </Box>
    )}
  />
);

export const InitialFilters = () => (
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
        filterFn: 'between',
        header: 'Age',
        type: 'number',
      },
      {
        accessorKey: 'gender',
        filterSelectOptions: ['Male', 'Female', 'Other'],
        header: 'Gender',
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
    ]}
    data={data}
    enableColumnFilterModes
    initialState={{
      columnFilters: [
        { id: 'firstName', value: 'Jo' },
        { id: 'age', value: [18, 100] },
      ],
    }}
  />
);
