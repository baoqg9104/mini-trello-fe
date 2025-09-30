import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from "@mui/material";

interface DeleteBoardDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteBoardDialog({ open, onClose, onDelete }: DeleteBoardDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Board</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this board?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={onDelete} variant="contained" color="error">Delete</Button>
      </DialogActions>
    </Dialog>
  );
}
