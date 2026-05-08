export enum TransactionEntityType {
  RootShelf = "RootShelf",
  SubShelf = "SubShelf",
  BlockPack = "BlockPack",
  BlockGroup = "BlockGroup",
  Block = "Block",
}

export const AllTransactionEntityTypes = Object.values(TransactionEntityType);
