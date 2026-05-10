export enum TransactionActionType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  MOVE = "MOVE",
  RESTORE = "RESTORE",
  DELETE = "DELETE",
}

export const AllTransactionActionTypes = Object.values(TransactionActionType);
