import { MaterialReactTable } from '../../src';
import { type Meta } from '@storybook/react';
import {
  backendColumnsToTableColumns,
} from '../../src';
import {
  initialStateMock,
  mockData,
} from '../../src/adapters/defaultAdapter/mockData';

// -----------------------------------------------------------------
// Meta – ovo registrira story u Storybook sidebar
// -----------------------------------------------------------------
const meta: Meta = {
  title: 'My Tables/MyCustomTable',
};

export default meta;
/** Osnovna tabela – nasljeđuje ThemeProvider iz preview.tsx */
export const Default = () => {
const columns = backendColumnsToTableColumns(initialStateMock.gridColDef);
const data = mockData.rows.map((row) => row.data);
  return <MaterialReactTable columns={columns} data={data} enableColumnVirtualization enableRowVirtualization />
};
