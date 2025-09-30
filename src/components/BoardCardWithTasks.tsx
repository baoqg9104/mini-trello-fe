import {
  CardContent,
  Typography,
  Box,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import type { Card as CardType } from "../types/card";
import type { Task as TaskType } from "../types/task";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import axios from "axios";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";

export interface Task {
  id: string;
  title: string;
  description: string;
}

export interface BoardCardWithTasksProps {
  card: CardType;
  boardId: string;
  onEditCard?: (card: CardType) => void;
  onDeleteCard?: (card: CardType) => void;
  refreshTick?: number;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

export default function BoardCardWithTasks({
  card,
  boardId,
  onEditCard,
  onDeleteCard,
  refreshTick,
  dragHandleProps,
}: BoardCardWithTasksProps) {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [addTaskLoading, setAddTaskLoading] = useState(false);
  const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false);
  const [deleteTask, setDeleteTask] = useState<TaskType | null>(null);
  const [deleteTaskLoading, setDeleteTaskLoading] = useState(false);

  const [assigned, setAssigned] = useState<Record<string, string[]>>({});
  const [assignInput, setAssignInput] = useState<Record<string, string>>({});
  const [assigning, setAssigning] = useState<Record<string, boolean>>({});

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await axiosInstance.get(
        `/boards/${boardId}/cards/${card.id}/tasks`
      );
      setTasks(res.data || []);

      for (const t of res.data || []) {
        await loadAssignedMembers(t.id);
      }
    } catch {
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line
  }, [card.id]);

  useEffect(() => {
    if (typeof refreshTick !== "number") return;
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTick]);

  // Add task
  const handleAddTask = async () => {
    if (!taskTitle.trim()) return;
    setAddTaskLoading(true);
    try {
      await axiosInstance.post(`/boards/${boardId}/cards/${card.id}/tasks`, {
        title: taskTitle,
        description: taskDescription,
        status: "todo",
      });
      setTaskTitle("");
      setTaskDescription("");
      setShowAddTask(false);
      await loadTasks();
    } catch (e) {
      console.error("Add task failed", e);
    }
    setAddTaskLoading(false);
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (!deleteTask) return;
    setDeleteTaskLoading(true);
    try {
      await axiosInstance.delete(
        `/boards/${boardId}/cards/${card.id}/tasks/${deleteTask.id}`
      );
      setDeleteTaskDialogOpen(false);
      await loadTasks();
    } catch (e) {
      console.error("Delete task failed", e);
    }
    setDeleteTaskLoading(false);
  };

  // Load assigned members of a task
  const loadAssignedMembers = async (taskId: string) => {
    try {
      const res = await axiosInstance.get(
        `/boards/${boardId}/cards/${card.id}/tasks/${taskId}/assign`
      );
      const list = (res.data as Array<{ memberId: string }>) || [];
      const members: string[] = list.map((m) => m.memberId);
      setAssigned((prev) => ({ ...prev, [taskId]: members }));
    } catch (e) {
      console.debug("loadAssignedMembers ignored error", e);
    }
  };

  const handleAssign = async (taskId: string) => {
    const memberId = (assignInput[taskId] || "").trim();
    if (!memberId) return;
    setAssigning((p) => ({ ...p, [taskId]: true }));
    try {
      await axiosInstance.post(
        `/boards/${boardId}/cards/${card.id}/tasks/${taskId}/assign`,
        { memberId }
      );
      setAssignInput((p) => ({ ...p, [taskId]: "" }));
      toast.success("Member assigned");
      await loadAssignedMembers(taskId);
    } catch (e) {
      console.error("Assign member failed", e);

      // if 403 -> member not in board
      if (axios.isAxiosError(e) && e.response?.status === 403) {
        toast.error("Cannot assign: member not in board");
      } else {
        toast.error("Failed to assign member");
      }
    } finally {
      setAssigning((p) => ({ ...p, [taskId]: false }));
    }
  };

  const handleUnassign = async (taskId: string, memberId: string) => {
    try {
      await axiosInstance.delete(
        `/boards/${boardId}/cards/${card.id}/tasks/${taskId}/assign/${memberId}`
      );
      await loadAssignedMembers(taskId);
    } catch (e) {
      console.error("Unassign member failed", e);
    }
  };

  return (
    <Card sx={{ minWidth: 280, mb: 2, bgcolor: "#f7fafc" }}>
      <CardContent>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          {...(dragHandleProps || {})}
        >
          <Typography variant="h6">{card.name}</Typography>
          <Box>
            <IconButton size="small" onClick={() => onEditCard?.(card)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDeleteCard?.(card)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Droppable droppableId={`tasks-${card.id}`} type="TASK">
          {(dropProvided) => (
            <Box
              mt={2}
              display="flex"
              flexDirection="column"
              gap={1}
              ref={dropProvided.innerRef}
              {...dropProvided.droppableProps}
            >
              {loadingTasks ? (
                <Typography fontSize={14} color="text.secondary">
                  Loading tasks...
                </Typography>
              ) : tasks.length === 0 ? (
                <Typography fontSize={14} color="text.secondary">
                  No tasks
                </Typography>
              ) : (
                tasks.map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={`task-${task.id}`}
                    index={index}
                  >
                    {(dragProvided) => (
                      <Box
                        p={1}
                        bgcolor="#fff"
                        borderRadius={2}
                        boxShadow={1}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                      >
                        <Box flex={1} pr={1}>
                          <Typography fontWeight={600}>{task.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {task.description}
                          </Typography>
                          {/* Assigned members */}
                          <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                            {(assigned[task.id] || []).map((m) => (
                              <Chip
                                key={m}
                                label={m}
                                size="small"
                                onDelete={() => handleUnassign(task.id, m)}
                              />
                            ))}
                          </Box>
                          <Box mt={1} display="flex" gap={1}>
                            <TextField
                              size="small"
                              placeholder="member id/email"
                              value={assignInput[task.id] || ""}
                              onChange={(e) =>
                                setAssignInput((p) => ({
                                  ...p,
                                  [task.id]: e.target.value,
                                }))
                              }
                            />
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleAssign(task.id)}
                              disabled={assigning[task.id]}
                            >
                              Assign
                            </Button>
                          </Box>
                        </Box>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setDeleteTask(task);
                              setDeleteTaskDialogOpen(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    )}
                  </Draggable>
                ))
              )}
              {dropProvided.placeholder}
            </Box>
          )}
        </Droppable>
        <Button
          size="small"
          sx={{ mt: 2 }}
          onClick={() => setShowAddTask(true)}
        >
          + Add Task
        </Button>
      </CardContent>

      <Dialog
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            type="text"
            fullWidth
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            minRows={2}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddTask(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleAddTask}
            variant="contained"
            color="primary"
            disabled={addTaskLoading}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteTaskDialogOpen}
        onClose={() => setDeleteTaskDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteTaskDialogOpen(false)}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteTask}
            color="error"
            variant="contained"
            disabled={deleteTaskLoading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
