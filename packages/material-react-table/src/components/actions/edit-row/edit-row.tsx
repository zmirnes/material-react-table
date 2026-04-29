import EditNoteIcon from '@mui/icons-material/EditNote';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

const EditRowAction = () => {
  return (
    <Tooltip title={'uredi'}>
      <IconButton
        sx={{ p: 0 }}
        disableRipple
        color="primary"
        onClick={() => console.log('uredi')}
      >
        <EditNoteIcon />
      </IconButton>
    </Tooltip>
  );
};
export default EditRowAction;
