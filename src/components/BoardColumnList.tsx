import { Box } from "@mui/material";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import BoardCardWithTasks from "./BoardCardWithTasks";
import type { Card } from "../types/card";

interface BoardColumnListProps {
  cards: Card[];
  boardId: string;
  columnId: string;
  onEditCard?: (card: Card) => void;
  onDeleteCard?: (card: Card) => void;
  refreshTick?: number;
}

export default function BoardColumnList({ cards, boardId, columnId, onEditCard, onDeleteCard, refreshTick }: BoardColumnListProps) {
  return (
    <Droppable droppableId={columnId} type="CARD">
      {(provided) => (
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          pb={2}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {cards.map((card, index) => (
            <Draggable key={card.id} draggableId={card.id} index={index}>
              {(dragProvided) => (
                <Box
                  width="100%"
                  ref={dragProvided.innerRef}
                  {...dragProvided.draggableProps}
                >
                  <BoardCardWithTasks
                    card={card}
                    boardId={boardId}
                    refreshTick={refreshTick}
                    dragHandleProps={dragProvided.dragHandleProps}
                    onEditCard={() => onEditCard?.(card)}
                    onDeleteCard={() => onDeleteCard?.(card)}
                  />
                </Box>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </Box>
      )}
    </Droppable>
  );
}
