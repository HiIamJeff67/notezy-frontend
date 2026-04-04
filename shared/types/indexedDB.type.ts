import { UUID } from "crypto";
import { ImageInfo, ImageThumbnailInfo } from "./imageInfo.type";

export enum IndexedDBKey {
  backgroundImageThumbnails = "backgroundImageThumbnails",
  backgroundImages = "backgroundImages",
  currentBackgroundImageId = "currentBackgroundImageId",
  currentProfileCoverBackgroundImageId = "currentProfileCoverBackgroundImageId",
}

export interface IndexedDBItem {
  [IndexedDBKey.backgroundImageThumbnails]: ImageThumbnailInfo | null;
  [IndexedDBKey.backgroundImages]: ImageInfo | null;
  [IndexedDBKey.currentBackgroundImageId]: UUID | null;
  [IndexedDBKey.currentProfileCoverBackgroundImageId]: UUID | null;
}
