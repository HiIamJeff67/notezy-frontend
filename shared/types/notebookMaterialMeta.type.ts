import { PartialBlock } from "@blocknote/core";
import { MaterialType } from "@shared/enums";
import { UUID } from "crypto";
import { generateUUID } from "./uuidv4.type";

/*
 * This is only used as the interface between NotezyAPI and BlockNoteEditor
 */
export interface NotebookMaterialMeta {
  id: UUID;
  parentId: UUID;
  rootId: UUID;
  name: string;
  type: MaterialType;
  size: number;
  path: UUID[];
  initialContent: PartialBlock[] | undefined;
  updatedAt: Date | undefined;
  createdAt: Date | undefined;
}

export const getDefaultNotebookMaterialMeta = (
  materialId: UUID,
  parentSubShelfId: UUID,
  rootShelfId: UUID = generateUUID()
): NotebookMaterialMeta => {
  return {
    id: materialId,
    parentId: parentSubShelfId,
    rootId: rootShelfId,
    name: "Untitled",
    type: MaterialType.Notebook,
    size: 0,
    path: [],
    initialContent: undefined,
    updatedAt: undefined,
    createdAt: undefined,
  };
};
