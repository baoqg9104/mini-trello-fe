import type { Task } from "./task";

export interface Card {
  id: string;
  name: string;
  description: string;
  status: "todo" | "doing" | "done";
  tasks: Task[];
}
