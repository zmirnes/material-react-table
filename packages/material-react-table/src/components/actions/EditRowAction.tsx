import MRT_EditRowButton from '../buttons/MRT_EditRowButton';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

interface EditRowActionProps<TData extends MRT_RowData> {
  onEditConfirm?: () => void;
  table: MRT_TableInstance<TData>;
}
const EditRowAction = <TData extends MRT_RowData>({
  onEditConfirm: _onEditConfirm,
  table,
}: EditRowActionProps<TData>) => {
  const { setNewEntryModal } = table;
  const handleOpenEditModal = () => {
    setNewEntryModal({
      open: true,
      mode: 'edit',
    });
  };

  return (
    <>
      <MRT_EditRowButton onClick={handleOpenEditModal} />
    </>
  );
};
export default EditRowAction;
