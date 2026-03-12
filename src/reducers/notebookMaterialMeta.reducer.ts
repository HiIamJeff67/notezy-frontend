import { PartialBlock } from "@blocknote/core";
import { MaterialType } from "@shared/enums";
import { NotebookMaterialMeta } from "@shared/types/notebookMaterialMeta.type";

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
