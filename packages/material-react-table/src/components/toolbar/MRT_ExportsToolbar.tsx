import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import { CircularProgress } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Dispatch, MouseEvent, SetStateAction, useMemo, useState } from 'react';
import {
  MRT_ActiveExportsState,
  MRT_ExportDefinition,
  MRT_ExportFileResponse,
  MRT_ExportParams,
  MRT_RowData,
  MRT_TableInstance,
} from '../../types';
import { downloadExportFiles } from '../../utils/exports/download-files';
import { printExportFiles } from '../../utils/exports/print-pdf';

export interface MRT_ExportsToolbarProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
  availableExports: Record<string, MRT_ExportDefinition>;
  exportState: MRT_ActiveExportsState;
  onExportStateChange: Dispatch<
    SetStateAction<MRT_ActiveExportsState | undefined>
  >;
  loadExport: (params: MRT_ExportParams) => Promise<MRT_ExportFileResponse[]>;
}

export const MRT_ExportsToolbar = <TData extends MRT_RowData>({
  table,
  availableExports,
  exportState,
  onExportStateChange,
  loadExport,
}: MRT_ExportsToolbarProps<TData>) => {
  const theme = useTheme();
  const { localization } = table.options;
  const { selectedExports, selectedFormat, grouped } = exportState;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [loadingExportType, setLoadingExportType] = useState<
    'download' | 'print' | null
  >(null);

  const { rowSelection } = table.getState();
  const selectedRowIds = Object.keys(rowSelection).filter(
    (id) => rowSelection[id],
  );
  const isNoRowsSelected = selectedRowIds.length === 0;

  const availableFormats = useMemo(() => {
    const allFormats = Object.values(availableExports).flatMap(
      (exp) => exp.formats,
    );
    return Array.from(new Set(allFormats));
  }, [availableExports]);

  const hasPdfFormat = availableFormats.includes('pdf');

  const exportTypesForSelectedFormat = useMemo(() => {
    if (!selectedFormat) return [];
    return Object.values(availableExports).filter((exp) =>
      exp.formats.includes(selectedFormat),
    );
  }, [availableExports, selectedFormat]);

  const isPrintDisabled =
    selectedFormat !== 'pdf' ||
    !selectedFormat ||
    selectedExports.length < 1 ||
    (!grouped && selectedExports.length > 1);

  const isDownloadDisabled = !selectedFormat || selectedExports.length < 1;

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectFormat = (format: string) => {
    const newFormat = selectedFormat === format ? null : format;
    onExportStateChange((prev) => ({
      ...(prev ?? { grouped: false }),
      selectedExports: [],
      selectedFormat: newFormat,
    }));
  };

  const handleToggleExportType = (exportName: string) => {
    const isAlreadySelected = selectedExports.includes(exportName);
    const newSelectedExports = isAlreadySelected
      ? selectedExports.filter((name) => name !== exportName)
      : [...selectedExports, exportName];

    onExportStateChange((prev) => ({
      ...(prev ?? { selectedFormat: null, grouped: false }),
      selectedExports: newSelectedExports,
    }));
  };

  const handleToggleGrouped = () => {
    onExportStateChange((prev) => ({
      ...(prev ?? { selectedFormat: null, selectedExports: [] }),
      grouped: !grouped,
    }));
  };

  const handleExportAction = async (type: 'download' | 'print') => {
    setLoadingExportType(type);
    try {
      const response = await loadExport({
        format: selectedFormat,
        exports: selectedExports,
        separated_files: !grouped,
        download: false,
        ids: JSON.stringify(selectedRowIds),
        type,
      });

      handleCloseMenu();

      if (type === 'download') {
        downloadExportFiles(response);
      } else {
        printExportFiles(response);
      }
    } finally {
      setLoadingExportType(null);
    }
  };

  const renderFormatSelector = () => (
    <Stack
      justifyContent="flex-start"
      minWidth="200px"
      sx={{
        borderRight: selectedFormat
          ? `1px dashed ${theme.palette.divider}`
          : 'none',
      }}
    >
      <FormControl>
        <RadioGroup value={selectedFormat ?? ''}>
          {availableFormats.map((format) => (
            <FormControlLabel
              key={format}
              sx={{ m: 0 }}
              value={format}
              control={
                <Radio
                  size="small"
                  onClick={() => handleSelectFormat(format)}
                />
              }
              label={
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {format}
                </Typography>
              }
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Stack>
  );

  const renderExportTypeSelector = () => {
    if (!selectedFormat || exportTypesForSelectedFormat.length === 0)
      return null;
    return (
      <Stack minWidth="250px" maxHeight="500px" sx={{ overflowY: 'auto' }}>
        {exportTypesForSelectedFormat.map((exportType) => (
          <MenuItem
            key={exportType.name}
            onClick={() => handleToggleExportType(exportType.name)}
            value={exportType.name}
          >
            <Checkbox
              checked={selectedExports.includes(exportType.name)}
              size="small"
            />
            <Typography variant="body2">{exportType.label}</Typography>
          </MenuItem>
        ))}
      </Stack>
    );
  };

  const renderActionButtons = () => {
    const isAnyLoading = loadingExportType !== null;

    return (
      <Stack direction="row" gap={0.5} mt={1} mr={2}>
        {hasPdfFormat && (
          <Button
            sx={{ display: 'flex', gap: 0.5 }}
            disabled={isPrintDisabled || isAnyLoading}
            onClick={() => handleExportAction('print')}
            startIcon={
              loadingExportType === 'print' ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PrintIcon fontSize="small" />
              )
            }
          >
            {localization.exportPrintPdf}
          </Button>
        )}
        <Button
          sx={{ display: 'flex', gap: 0.5 }}
          disabled={isDownloadDisabled || isAnyLoading}
          onClick={() => handleExportAction('download')}
          startIcon={
            loadingExportType === 'download' ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <FileDownloadIcon fontSize="small" />
            )
          }
        >
          {localization.exportDownload}
        </Button>
      </Stack>
    );
  };

  const renderGroupedCheckbox = () => (
    <Stack mt="auto">
      <FormControlLabel
        onChange={handleToggleGrouped}
        sx={{ m: 0 }}
        control={<Checkbox checked={grouped} size="small" />}
        label={
          <Typography variant="body2">{localization.exportGrouped}</Typography>
        }
      />
    </Stack>
  );

  return (
    <Stack direction="row" gap={0.5} alignItems="center">
      <Tooltip
        title={
          isNoRowsSelected
            ? localization.exportSelectRowsTooltip
            : localization.exportButton
        }
      >
        <span>
          <Button
            aria-label={localization.exportButton}
            disabled={isNoRowsSelected}
            onClick={handleOpenMenu}
            size="small"
            startIcon={<FileDownloadIcon fontSize="small" />}
            variant="text"
          >
            {localization.exportButton}
          </Button>
        </span>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Stack
          direction="row"
          sx={{ px: 1, pt: 1, maxHeight: '320px', overflow: 'auto' }}
        >
          {renderFormatSelector()}
          {selectedFormat &&
            exportTypesForSelectedFormat.length > 0 &&
            renderExportTypeSelector()}
        </Stack>
        <Divider sx={{ mt: 1 }} />
        <Stack direction="row" alignItems="center" sx={{ px: 1, pb: 1 }}>
          {renderActionButtons()}
          {renderGroupedCheckbox()}
        </Stack>
      </Menu>
    </Stack>
  );
};
