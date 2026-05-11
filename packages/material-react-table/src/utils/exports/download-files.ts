import { type MRT_ExportFileResponse } from '../../types';

export const downloadExportFiles = (files: MRT_ExportFileResponse[]): void => {
  files.forEach((file) => {
    const binaryString = atob(file.content);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: 'application/octet-stream' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = file.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  });
};
