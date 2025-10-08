import { PartialBlock } from "@blocknote/core";
import { UUID } from "crypto";
import { MaterialType } from "./enums";

/*
 * This is only used as the interface between NotezyAPI and BlockNoteEditor
 */
export interface NotebookMaterialMeta {
  id: UUID | undefined;
  name: string;
  type: MaterialType;
  initialContent: PartialBlock[] | undefined;
  updatedAt: Date | undefined;
  createdAt: Date | undefined;
}

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

export const DefaultNotebookMaterialMeta: NotebookMaterialMeta = {
  id: undefined,
  name: "Untitled",
  type: MaterialType.Notebook,
  initialContent: undefined,
  updatedAt: undefined,
  createdAt: undefined,
};

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
