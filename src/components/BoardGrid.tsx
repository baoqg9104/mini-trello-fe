import { Grid } from "@mui/material";
import BoardCard from "./BoardCard";
import type { Board } from "../types/board";

export default function BoardGrid({ boards }: { boards: Board[] }) {
  return (
    <Grid
      container
      spacing={{ xs: 2, sm: 3, md: 4 }}
      alignItems="center"
      justifyContent={{ xs: "center", sm: "flex-start" }}
    >
      {boards.map((board) => (
        <Grid key={board.id} sx={{ display: "flex" }}>
          <BoardCard board={board} />
        </Grid>
      ))}
    </Grid>
  );
}
