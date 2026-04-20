import printJS from 'print-js';
import { MRT_ExportFileResponse } from '../../types';

export const printExportFiles = (files: MRT_ExportFileResponse[]): void => {
  files.forEach((file) => {
    const binaryString = atob(file.content);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    printJS({
      printable: url,
      type: 'pdf',
      onLoadingEnd: () => URL.revokeObjectURL(url),
    });
  });
};
