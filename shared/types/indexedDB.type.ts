import type { UUID } from "crypto";
import { ImageContent, ImageInfo, ImageThumbnailInfo } from "./imageInfo.type";

export enum IndexedDBKey {
  backgroundImageThumbnails = "backgroundImageThumbnails",
  backgroundImages = "backgroundImages",
  currentBackgroundImage = "currentBackgroundImage",
  currentProfileCoverBackgroundImageId = "currentProfileCoverBackgroundImageId",
}

export interface IndexedDBItem {
  [IndexedDBKey.backgroundImageThumbnails]: ImageThumbnailInfo | null;
  [IndexedDBKey.backgroundImages]: ImageInfo | null;
  [IndexedDBKey.currentBackgroundImage]: ImageContent | null;
  [IndexedDBKey.currentProfileCoverBackgroundImageId]: UUID | null;
}
