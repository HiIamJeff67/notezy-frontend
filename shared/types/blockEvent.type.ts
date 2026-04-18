import { Block, BlockChangeSource } from "@blocknote/core";

// [Abandon] The original BlockEvent type on the documentation of BlockNote
// export type BlockEvent = {
//   type: "insert" | "update" | "delete" | "move";
//   payload: {
//     block: Block; // The affected block
//     source: BlockChangeSource; // The source of the change
//     prevBlock?: Block; // The block before the move (since a move can also update the block's content)
//     prevParent?: Block; // The previous parent block (if it existed).
//     currentParent?: Block; // The current parent block (if it exists).
//   };
//   timestamp: Date;
// };

export type BlockEvent = {
  type: "insert" | "update" | "delete" | "move";
  payload: {
    block: Block;
    source: BlockChangeSource;
    previous: {
      // the previous status
      block?: Block; // the previous status of the block
      prev?: Block; // the prev block(closest top neighbor) of the block
      // next?: Block;
    };
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
