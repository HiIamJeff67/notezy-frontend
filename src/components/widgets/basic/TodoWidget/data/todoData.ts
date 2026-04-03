import { UUID } from "crypto";

export interface TodoItem {
  id: UUID;
  text: string;
  completed: boolean;
  link?: string;
}

export type TodoData = {
  title: string;
  items: TodoItem[];
  updatedAt: Date;
  createdAt: Date;
};

export const getDefaultToDoData = (
  title?: string,
  items?: TodoItem[]
): TodoData => {
  return {
    title: title ?? "unknown",
    items: items ?? [],
    updatedAt: new Date(),
    createdAt: new Date(),
  };
};
