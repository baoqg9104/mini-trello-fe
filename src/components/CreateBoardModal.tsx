import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";

interface CreateBoardModalProps {
  show: boolean;
  onClose: () => void;
  onBoardCreated?: () => void;
}

export default function CreateBoardModal({
  show,
  onClose,
  onBoardCreated,
}: CreateBoardModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (!loading) {
      setName("");
      setDescription("");
      setError("");
      onClose();
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Board name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axiosInstance.post("/boards", { name: name.trim(), description });
      setName("");
      setDescription("");
      if (onBoardCreated) onBoardCreated();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to create board");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={show} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontSize: { xs: 18, sm: 22 } }}>
        Create New Board
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <TextField
          autoFocus
          margin="dense"
          label="Board Name"
          type="text"
          fullWidth
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
        <TextField
          margin="dense"
          label="Description"
          type="text"
          fullWidth
          multiline
          minRows={3}
          variant="outlined"
          size="small"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
        {error && (
          <div style={{ color: "red", marginTop: 8, fontSize: 14 }}>
            {error}
          </div>
        )}
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
        <Button onClick={handleClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Board"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
