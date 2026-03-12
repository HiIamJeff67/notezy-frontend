import { UUID } from "crypto";
import { ImageInfo } from "./imageInfo.type";

export enum IndexedDBKey {
  backgroundImages = "backgroundImages",
  currentDashboardBackgroundImageId = "currentDashboardBackgroundImageId",
  currentProfileCoverBackgroundImageId = "currentProfileCoverBackgroundImageId",
}

export interface IndexedDBItem {
  [IndexedDBKey.backgroundImages]: ImageInfo | null;
  [IndexedDBKey.currentDashboardBackgroundImageId]: UUID | null;
  [IndexedDBKey.currentProfileCoverBackgroundImageId]: UUID | null;
}
