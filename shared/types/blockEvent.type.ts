import { Block, BlockChangeSource } from "@blocknote/core";

export type BlockEvent = {
  type: "insert" | "update" | "delete" | "move";
  payload: {
    block: Block;
    source: BlockChangeSource;
    prevBlock?: Block;
    prevParent?: Block;
    currentParent?: Block;
  };
  timestamp: Date;
};

export interface InsertBlockEvent {
  type: "insert";
  block: Block;
  source: BlockChangeSource;
  prevBlock: undefined;
}

export interface UpdateBlockEvent {
  type: "update";
  block: Block;
  source: BlockChangeSource;
  prevBlock: Block;
}

export interface DeleteBlockEvent {
  type: "delete";
  block: Block;
  source: BlockChangeSource;
  prevBlock: undefined;
}

export interface MoveBlockEvent {
  type: "move";
  block: Block;
  source: BlockChangeSource;
  prevBlock: Block;
  prevParent?: Block;
  currentParent?: Block;
}
