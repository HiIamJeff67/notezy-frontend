export enum SessionStorageKey {
  csrfToken = "CSRFToken",
  terrainSeed = "TerrainSeed",
}

export interface SessionStorageItem {
  [SessionStorageKey.csrfToken]: string | null;
  [SessionStorageKey.terrainSeed]: number | null;
}
