import { Box, Typography, Button } from "@mui/material";

interface BoardHeaderProps {
  name: string;
  description: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function BoardHeader({ name, description, onEdit, onDelete }: BoardHeaderProps) {
  return (
    <Box mb={3} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#6d246d', mb: 0.5 }}>{name}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>{description}</Typography>
      </Box>
      <Box display="flex" gap={1} mt={{ xs: 2, md: 0 }}>
        <Button variant="outlined" color="primary" onClick={onEdit} sx={{ fontWeight: 600 }}>Edit</Button>
        <Button variant="outlined" color="error" onClick={onDelete} sx={{ fontWeight: 600 }}>Delete</Button>
      </Box>
    </Box>
  );
}
