import {
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from "@mui/material";

interface Member {
  id: string;
  name: string;
}

interface SidebarProps {
  boards: { id: string; name: string }[];
  currentBoardId: string;
  members: Member[];
}

export default function Sidebar({
  boards,
  currentBoardId,
  members,
}: SidebarProps) {
  return (
    <Box
      sx={{
        width: 260,
        bgcolor: "#23272f",
        color: "#fff",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 2,
      }}
    >
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: 700, color: "#bdbdbd" }}
      >
        Your boards
      </Typography>
      <List dense sx={{ mb: 3 }}>
        {boards.map((b) => (
          <ListItem
            key={b.id}
            sx={{
              bgcolor: b.id === currentBoardId ? "#3c4250" : "inherit",
              borderRadius: 2,
              mb: 0.5,
              cursor: "pointer",
              "&:hover": { bgcolor: "#2c313a" },
            }}
          >
            <ListItemText primary={b.name} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ bgcolor: "#444", mb: 2 }} />
      <Typography
        variant="subtitle2"
        sx={{ color: "#bdbdbd", mb: 1, fontWeight: 600 }}
      >
        Members
      </Typography>
      <List dense>
        {members.map((m) => (
          <ListItem key={m.id} sx={{ mb: 0.5 }}>
            <ListItemAvatar>
              <Avatar
                sx={{ bgcolor: "#b71c1c", width: 32, height: 32, fontSize: 16 }}
              >
                {m.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={m.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
