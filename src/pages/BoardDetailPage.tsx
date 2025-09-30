import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Board } from "../types/board";
import BoardColumnList from "../components/BoardColumnList";
import EditBoardDialog from "../components/EditBoardDialog";
import {
  Box,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from "@mui/material";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import axiosInstance from "../utils/axiosInstance";
import type { Card } from "../types/card";

type BoardColumn = {
  id: string;
  name: string;
  cards: Card[];
};

const DEFAULT_COLUMNS: BoardColumn[] = [
  { id: "todo", name: "To do", cards: [] },
  { id: "doing", name: "Doing", cards: [] },
  { id: "done", name: "Done", cards: [] },
];

export default function BoardDetailPage() {
  const [editCardDialogOpen, setEditCardDialogOpen] = useState(false);
  const [editCard, setEditCard] = useState<Card | null>(null);
  const [editCardName, setEditCardName] = useState("");
  const [editCardDesc, setEditCardDesc] = useState("");

  const [deleteCardDialogOpen, setDeleteCardDialogOpen] = useState(false);
  const [deleteCard, setDeleteCard] = useState<Card | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [addCardOpen, setAddCardOpen] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [newCardName, setNewCardName] = useState<{ [key: string]: string }>({});
  const [newCardDesc, setNewCardDesc] = useState<{ [key: string]: string }>({});
  const [addCardLoading, setAddCardLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [addCardError, setAddCardError] = useState<{ [key: string]: string }>(
    {}
  );
  const { id } = useParams<{ id: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<BoardColumn[]>(DEFAULT_COLUMNS);

  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!id) return;
    const interval = setInterval(async () => {
      try {
        const cardsRes = await axiosInstance.get(`/boards/${id}/cards`);
        const cards = cardsRes.data || [];
        const todoCards = cards.filter((c: Card) => c.status === "todo");
        const doingCards = cards.filter((c: Card) => c.status === "doing");
        const doneCards = cards.filter((c: Card) => c.status === "done");
        setColumns([
          { id: "todo", name: "To do", cards: todoCards },
          { id: "doing", name: "Doing", cards: doingCards },
          { id: "done", name: "Done", cards: doneCards },
        ]);
      } catch (e) {
        console.debug("cards refresh polling failed", e);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (type === "CARD") {
      setColumns((prev) => {
        const newCols = prev.map((c) => ({ ...c, cards: [...c.cards] }));
        const srcCol = newCols.find((c) => c.id === source.droppableId);
        const dstCol = newCols.find((c) => c.id === destination.droppableId);
        if (!srcCol || !dstCol) return prev;
        const [moved] = srcCol.cards.splice(source.index, 1);
        if (!moved) return prev;

        if (srcCol.id !== dstCol.id) {
          moved.status = dstCol.id as "todo" | "doing" | "done";
          axiosInstance
            .put(`/boards/${id}/cards/${moved.id}`, {
              name: moved.name,
              description: moved.description,
              status: moved.status,
            })
            .catch(() => {});
        }
        dstCol.cards.splice(destination.index, 0, moved);
        return newCols;
      });
      return;
    }

    if (type === "TASK") {
      const src = source.droppableId.replace(/^tasks-/, "");
      const dst = destination.droppableId.replace(/^tasks-/, "");

      const taskId = (result.draggableId || "").replace(/^task-/, "");
      if (!taskId || !src || !dst) return;

      if (src !== dst) {
        const allCards: Card[] = columns.flatMap((c) => c.cards);
        const destCard = allCards.find((c) => c.id === dst);
        const newStatus = destCard?.status ?? "todo";
        axiosInstance
          .put(`/boards/${id}/cards/${src}/tasks/${taskId}`, {
            status: newStatus,
            cardId: dst,
          })
          .then(() => {
            setRefreshTick((t) => t + 1);
          })
          .catch(() => {});
      } else {
        setRefreshTick((t) => t + 1);
      }
    }
  };

  useEffect(() => {
    const fetchBoardDetails = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/boards/${id}`);
        setBoard({
          id: res.data.id,
          name: res.data.name,
          description: res.data.description,
          members: res.data.members || [],
        });

        const cardsRes = await axiosInstance.get(`/boards/${id}/cards`);
        const cards = cardsRes.data || [];
        const todoCards = cards.filter((c: Card) => c.status === "todo");
        const doingCards = cards.filter((c: Card) => c.status === "doing");
        const doneCards = cards.filter((c: Card) => c.status === "done");

        setColumns([
          { id: "todo", name: "To do", cards: todoCards },
          { id: "doing", name: "Doing", cards: doingCards },
          { id: "done", name: "Done", cards: doneCards },
        ]);
      } catch {
        console.error("Failed to fetch board details or cards");
        setColumns(DEFAULT_COLUMNS);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBoardDetails();
  }, [id]);

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const handleEdit = () => {
    setEditMode(true);
    setEditName(board?.name || "");
    setEditDescription(board?.description || "");
    setEditError(null);
  };

  const handleEditSave = async () => {
    if (!editName.trim()) {
      setEditError("Name is required");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.put(`/boards/${id}`, {
        name: editName,
        description: editDescription,
      });

      const res = await axiosInstance.get(`/boards/${id}`);
      setBoard({
        id: res.data.id,
        name: res.data.name,
        description: res.data.description,
        members: res.data.members || [],
      });
      setEditMode(false);
    } catch {
      setEditError("Failed to update board");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" minHeight="100vh" bgcolor="#f5f6f8">
      <Box
        component="aside"
        width={{ xs: 0, md: 260 }}
        display={{ xs: "none", md: "flex" }}
        flexDirection="column"
        borderRight="1px solid #e5e7eb"
        bgcolor="#fff"
        p={2}
        gap={2}
      >
        <Box>
          <Box fontWeight={700} fontSize={18} color="#111">
            {board?.name || "Untitled board"}
          </Box>
          <Box fontSize={14} color="#666" mt={0.5}>
            {board?.description || "No description"}
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", alignSelf: "flex-start" }}
            onClick={handleEdit}
          >
            Edit board
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={{ textTransform: "none", alignSelf: "flex-start" }}
            onClick={() => setInviteOpen(true)}
          >
            Invite member
          </Button>
        </Box>
        {/* Invite member dialog */}
        <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)}>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogContent>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              sx={{ mt: 1 }}
              disabled={inviteLoading}
            />
            {inviteError && (
              <Box color="error.main" mt={1}>
                {inviteError}
              </Box>
            )}
            {inviteSuccess && (
              <Box color="success.main" mt={1}>
                {inviteSuccess}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setInviteOpen(false)}
              disabled={inviteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                setInviteLoading(true);
                setInviteError("");
                setInviteSuccess("");
                try {
                  if (!inviteEmail) {
                    setInviteError("Email is required");
                    setInviteLoading(false);
                    return;
                  }
                  const res = await axiosInstance.post(`/boards/${id}/invite`, {
                    email: inviteEmail,
                  });
                  if (res.status === 200) {
                    setInviteSuccess("Invitation sent!");
                    setInviteEmail("");
                  } else {
                    setInviteError(
                      res.data?.error || "Failed to send invitation"
                    );
                  }
                } catch (err: unknown) {
                  console.error("Invite error:", err);
                } finally {
                  setInviteLoading(false);
                }
              }}
              disabled={inviteLoading}
            >
              Send Invite
            </Button>
          </DialogActions>
        </Dialog>
        <Box mt={1}>
          <Box fontWeight={600} fontSize={14} color="#222" mb={1}>
            Members
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            {board?.members.map((m) => (
              <Box key={m} display="flex" alignItems="center" gap={1}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>
                  {m.charAt(0) || "?"}
                </Avatar>
                <Box fontSize={14} color="#333">
                  {m}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box component="main" flex={1} minWidth={0} p={{ xs: 2, md: 3 }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box
            display="flex"
            gap={2}
            alignItems="flex-start"
            overflow="auto"
            pb={2}
          >
            {columns.map((column) => (
              <Box
                key={column.id}
                maxWidth={350}
                width="100%"
                bgcolor="#fff"
                borderRadius={2}
                boxShadow={1}
                p={2}
                sx={{
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: 3 },
                }}
              >
                <Box fontWeight={700} fontSize={17} mb={1} color="#222">
                  {column.name}
                </Box>
                {id && (
                  <BoardColumnList
                    cards={column.cards}
                    boardId={id}
                    columnId={column.id}
                    refreshTick={refreshTick}
                    onEditCard={(card) => {
                      setEditCard(card);
                      setEditCardName(card.name);
                      setEditCardDesc(card.description);
                      setEditCardDialogOpen(true);
                    }}
                    onDeleteCard={(card) => {
                      setDeleteCard(card);
                      setDeleteCardDialogOpen(true);
                    }}
                  />
                )}

                {/* Add card UI */}
                {addCardOpen[column.id] ? (
                  <Box mt={2} p={1} bgcolor="#f8f8f8" borderRadius={1}>
                    <input
                      type="text"
                      placeholder="Card name"
                      value={newCardName[column.id] || ""}
                      onChange={(e) =>
                        setNewCardName((prev) => ({
                          ...prev,
                          [column.id]: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        marginBottom: 6,
                        padding: 6,
                        borderRadius: 4,
                        border: "1px solid #ccc",
                      }}
                    />
                    <textarea
                      placeholder="Description"
                      value={newCardDesc[column.id] || ""}
                      onChange={(e) =>
                        setNewCardDesc((prev) => ({
                          ...prev,
                          [column.id]: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        marginBottom: 6,
                        padding: 6,
                        borderRadius: 4,
                        border: "1px solid #ccc",
                      }}
                    />
                    {addCardError[column.id] && (
                      <Box color="error.main" fontSize={13} mb={1}>
                        {addCardError[column.id]}
                      </Box>
                    )}
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={addCardLoading[column.id]}
                        onClick={async () => {
                          if (!newCardName[column.id]) {
                            setAddCardError((prev) => ({
                              ...prev,
                              [column.id]: "Card name is required",
                            }));
                            return;
                          }
                          setAddCardLoading((prev) => ({
                            ...prev,
                            [column.id]: true,
                          }));
                          setAddCardError((prev) => ({
                            ...prev,
                            [column.id]: "",
                          }));
                          try {
                            const response = await axiosInstance.post(
                              `/boards/${id}/cards`,
                              {
                                name: newCardName[column.id],
                                description: newCardDesc[column.id],
                                status: column.id,
                              }
                            );
                            if (response.status !== 201 || !response.data?.id) {
                              setAddCardError((prev) => ({
                                ...prev,
                                [column.id]:
                                  "API error: Could not create card.",
                              }));
                              console.error("API error:", response);
                              return;
                            }
                            // Refresh cards
                            const cardsRes = await axiosInstance.get(
                              `/boards/${id}/cards`
                            );
                            const cards = cardsRes.data || [];
                            const todoCards = cards.filter(
                              (c: Card) => c.status === "todo"
                            );
                            const doingCards = cards.filter(
                              (c: Card) => c.status === "doing"
                            );
                            const doneCards = cards.filter(
                              (c: Card) => c.status === "done"
                            );
                            setColumns([
                              { id: "todo", name: "To do", cards: todoCards },
                              { id: "doing", name: "Doing", cards: doingCards },
                              { id: "done", name: "Done", cards: doneCards },
                            ]);
                            setNewCardName((prev) => ({
                              ...prev,
                              [column.id]: "",
                            }));
                            setNewCardDesc((prev) => ({
                              ...prev,
                              [column.id]: "",
                            }));
                            setAddCardOpen((prev) => ({
                              ...prev,
                              [column.id]: false,
                            }));
                          } catch (err: unknown) {
                            console.error("Add card error:", err);
                          } finally {
                            setAddCardLoading((prev) => ({
                              ...prev,
                              [column.id]: false,
                            }));
                          }
                        }}
                      >
                        Add
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setAddCardOpen((prev) => ({
                            ...prev,
                            [column.id]: false,
                          }));
                          setNewCardName((prev) => ({
                            ...prev,
                            [column.id]: "",
                          }));
                          setNewCardDesc((prev) => ({
                            ...prev,
                            [column.id]: "",
                          }));
                          setAddCardError((prev) => ({
                            ...prev,
                            [column.id]: "",
                          }));
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    mt={2}
                    p={1}
                    bgcolor="#f0f0f0"
                    textAlign="center"
                    borderRadius={1}
                    sx={{
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#e0e0e0" },
                    }}
                    onClick={() =>
                      setAddCardOpen((prev) => ({ ...prev, [column.id]: true }))
                    }
                  >
                    + Add a card
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </DragDropContext>
        <EditBoardDialog
          open={editMode}
          loading={loading}
          name={editName}
          description={editDescription}
          error={editError || ""}
          onNameChange={setEditName}
          onDescriptionChange={setEditDescription}
          onClose={() => setEditMode(false)}
          onSave={handleEditSave}
        />

        <Dialog
          open={editCardDialogOpen}
          onClose={() => setEditCardDialogOpen(false)}
        >
          <DialogTitle>Edit Card</DialogTitle>
          <DialogContent>
            <TextField
              label="Card Name"
              fullWidth
              value={editCardName}
              onChange={(e) => setEditCardName(e.target.value)}
              sx={{ mt: 1 }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={2}
              value={editCardDesc}
              onChange={(e) => setEditCardDesc(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditCardDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!editCard || !editCardName.trim()) return;

                await axiosInstance.put(`/boards/${id}/cards/${editCard.id}`, {
                  name: editCardName,
                  description: editCardDesc,
                  status: editCard.status,
                });

                const cardsRes = await axiosInstance.get(`/boards/${id}/cards`);
                const cards = cardsRes.data || [];
                const todoCards = cards.filter(
                  (c: Card) => c.status === "todo"
                );
                const doingCards = cards.filter(
                  (c: Card) => c.status === "doing"
                );
                const doneCards = cards.filter(
                  (c: Card) => c.status === "done"
                );
                setColumns([
                  { id: "todo", name: "To do", cards: todoCards },
                  { id: "doing", name: "Doing", cards: doingCards },
                  { id: "done", name: "Done", cards: doneCards },
                ]);
                setEditCardDialogOpen(false);
              }}
              variant="contained"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteCardDialogOpen}
          onClose={() => setDeleteCardDialogOpen(false)}
        >
          <DialogTitle>Delete Card</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this card?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteCardDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!deleteCard) return;
                await axiosInstance.delete(
                  `/boards/${id}/cards/${deleteCard.id}`
                );

                const cardsRes = await axiosInstance.get(`/boards/${id}/cards`);
                const cards = cardsRes.data || [];
                const todoCards = cards.filter(
                  (c: Card) => c.status === "todo"
                );
                const doingCards = cards.filter(
                  (c: Card) => c.status === "doing"
                );
                const doneCards = cards.filter(
                  (c: Card) => c.status === "done"
                );
                setColumns([
                  { id: "todo", name: "To do", cards: todoCards },
                  { id: "doing", name: "Doing", cards: doingCards },
                  { id: "done", name: "Done", cards: doneCards },
                ]);
                setDeleteCardDialogOpen(false);
              }}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
