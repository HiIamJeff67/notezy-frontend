import { MaterialMeta } from "@shared/types/materialMeta.type";

export type MaterialMetaAction =
  | {
      type: "init";
      payload: MaterialMeta;
    }
  | { type: "setName"; newName: string }
  | { type: "setSize"; newSize: number }
  | { type: "setContentType"; newContentType: string }
  | { type: "setParseMediaType"; newParseMediaType: string }
  | { type: "setDownloadURL"; newDownloadURL: string | null }
  | { type: "setUpdatedAt"; newUpdatedAt: Date }
  | { type: "setCreatedAt"; newCreatedAt: Date };

export function materialMetaReducer(
  state: MaterialMeta,
  action: MaterialMetaAction
): MaterialMeta {
  switch (action.type) {
    case "init":
      return { ...state, ...action.payload };
    case "setName":
      return { ...state, name: action.newName };
    case "setSize":
      return { ...state, size: action.newSize };
    case "setContentType":
      return { ...state, contentType: action.newContentType };
    case "setParseMediaType":
      return { ...state, parseMediaType: action.newParseMediaType };
    case "setDownloadURL":
      return { ...state, downloadURL: action.newDownloadURL };
    case "setUpdatedAt":
      return { ...state, updatedAt: action.newUpdatedAt };
    case "setCreatedAt":
      return { ...state, createdAt: action.newCreatedAt };
    default:
      return state;
  }
}
