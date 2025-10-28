import { PartialBlock } from "@blocknote/core";
import { MaterialType } from "@shared/types/enums";
import { UUID } from "crypto";
import { generateUUID } from "./uuid_v4.type";

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
    rootId: rootShelfId,
    parentId: parentSubShelfId,
    name: "Untitled",
    type: MaterialType.Notebook,
    size: 0,
    path: [],
    initialContent: undefined,
    updatedAt: undefined,
    createdAt: undefined,
  };
};

export type NotebookMaterialMetaAction =
  | {
      type: "init";
      payload: NotebookMaterialMeta;
    }
  | { type: "setName"; newName: string }
  | { type: "setType"; newType: MaterialType }
  | {
      type: "setInitialContent";
      newInitialContent: PartialBlock[] | undefined;
    }
  | { type: "setUpdatedAt"; newUpdatedAt: Date }
  | { type: "setCreatedAt"; newCreatedAt: Date };

export function notebookMaterialMetaReducer(
  state: NotebookMaterialMeta,
  action: NotebookMaterialMetaAction
): NotebookMaterialMeta {
  switch (action.type) {
    case "init":
      return { ...state, ...action.payload };
    case "setName":
      return { ...state, name: action.newName };
    case "setType":
      return { ...state, type: action.newType };
    case "setInitialContent":
      return { ...state, initialContent: action.newInitialContent };
    case "setUpdatedAt":
      return { ...state, updatedAt: action.newUpdatedAt };
    case "setCreatedAt":
      return { ...state, createdAt: action.newCreatedAt };
    default:
      return state;
  }
}
