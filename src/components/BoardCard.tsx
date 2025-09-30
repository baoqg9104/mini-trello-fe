import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import type { Board } from "../types/board";
import { useNavigate } from "react-router-dom";

interface BoardCardProps {
  board: Board;
}

export default function BoardCard({ board }: BoardCardProps) {
  const navigate = useNavigate();
  return (
    <Card
      sx={{
        minWidth: 250,
        cursor: "pointer",
        transition: "0.2s",
        "&:hover": { boxShadow: 6 },
      }}
      onClick={() => navigate(`/boards/${board.id}`)}
    >
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom>
          {board.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {board.description}
        </Typography>
      </CardContent>
    </Card>
  );
}
