export enum SessionStorageKeys {
  CSRFToken = "CSRFToken",
}

export interface SessionStorageItem {
  [SessionStorageKeys.CSRFToken]: string | null;
}
