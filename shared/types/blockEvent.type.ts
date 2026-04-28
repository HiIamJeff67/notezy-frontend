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
      parent?: Block;
      prev?: Block; // the prev block(closest top neighbor) of the block
      // next?: Block;
    };
  };
  timestamp: Date;
};
