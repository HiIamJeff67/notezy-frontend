export enum TransactionEntityType {
  RootShelf = "RootShelf",
  SubShelf = "SubShelf",
  Item = "Item",
  BlockPack = "BlockPack",
  BlockGroup = "BlockGroup",
  Block = "Block",
  Station = "Station",
  Routine = "Routine",
  RoutineTag = "RoutineTag",
  RoutinesToItems = "RoutinesToItems",
  RoutinesToTags = "RoutinesToTags",
}

export const AllTransactionEntityTypes = Object.values(TransactionEntityType);
