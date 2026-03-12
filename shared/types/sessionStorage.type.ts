export enum SessionStorageKey {
  csrfToken = "CSRFToken",
}

export interface SessionStorageItem {
  [SessionStorageKey.csrfToken]: string | null;
}
