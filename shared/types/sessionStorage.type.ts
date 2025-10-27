export enum SessionStorageKeys {
  csrfToken = "CSRFToken",
}

export interface SessionStorageItem {
  [SessionStorageKeys.csrfToken]: string | null;
}
