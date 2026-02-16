import { SupportedBlockPackIcon } from "@shared/enums/supportedBlockPackIcon.enum";
import { BlockGroupMeta } from "@shared/types/blockGroupMeta.type";
import { BlockPackMeta } from "@shared/types/blockPackMeta.type";

export type BlockPackMetaAction =
  | {
      type: "init";
      payload: BlockPackMeta;
    }
  | { type: "setName"; newName: string }
  | { type: "setIcon"; newIcon: SupportedBlockPackIcon }
  | { type: "setHeaderBackgroundURL"; newHeaderBackgroundURL: string }
  | { type: "setBlockCount"; newBlockCount: number }
  | { type: "setUpdatedAt"; newUpdatedAt: Date }
  | { type: "setCreatedAt"; newCreatedAt: Date }
  | { type: "setBlockGroupMetas"; newBlockGroupMetas: BlockGroupMeta[] };

export function blockPackMetaReducer(
  state: BlockPackMeta,
  action: BlockPackMetaAction
): BlockPackMeta {
  switch (action.type) {
    case "init":
      return { ...state, ...action.payload };
    case "setName":
      return { ...state, name: action.newName };
    case "setIcon":
      return { ...state, icon: action.newIcon };
    case "setHeaderBackgroundURL":
      return { ...state, headerBackgroundURL: action.newHeaderBackgroundURL };
    case "setBlockCount":
      return { ...state, blockCount: action.newBlockCount };
    case "setUpdatedAt":
      return { ...state, updatedAt: action.newUpdatedAt };
    case "setCreatedAt":
      return { ...state, createdAt: action.newCreatedAt };
    case "setBlockGroupMetas":
      return { ...state, blockGroups: action.newBlockGroupMetas };
    default:
      return state;
  }
}
