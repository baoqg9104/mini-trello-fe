import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

interface EditBoardDialogProps {
  open: boolean;
  loading: boolean;
  name: string;
  description: string;
  error: string;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function EditBoardDialog({
  open,
  loading,
  name,
  description,
  error,
  onNameChange,
  onDescriptionChange,
  onClose,
  onSave,
}: EditBoardDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Board</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Board Name"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Description"
          type="text"
          fullWidth
          multiline
          minRows={3}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          disabled={loading}
        />
        {error && (
          <div style={{ color: "red", marginTop: 8, fontSize: 14 }}>
            {error}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={onSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
