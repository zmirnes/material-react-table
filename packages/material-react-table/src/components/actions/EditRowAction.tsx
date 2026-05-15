import MRT_EditRowButton from '../buttons/MRT_EditRowButton';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

interface EditRowActionProps<TData extends MRT_RowData> {
  onEditConfirm: () => Promise<void> | void;
  table?: MRT_TableInstance<TData>;
}
const EditRowAction = <TData extends MRT_RowData>({
  onEditConfirm,
}: EditRowActionProps<TData>) => {
  return (
    <>
      <MRT_EditRowButton onClick={onEditConfirm} />
    </>
  );
};
export default EditRowAction;
