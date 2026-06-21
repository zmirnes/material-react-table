import MRT_ExportRowButton from '../buttons/MRT_ExportRowButton';
import MRT_PrintRowButton from '../buttons/MRT_PrintRowButton';

interface ExportRowActionProps {
  onExport: () => Promise<void> | void;
  onPrint?: () => Promise<void> | void;
}

const ExportRowAction = ({ onExport, onPrint }: ExportRowActionProps) => {
  return (
    <>
      <MRT_ExportRowButton onClick={onExport} />
      {onPrint && <MRT_PrintRowButton onClick={onPrint} />}
    </>
  );
};

export default ExportRowAction;
