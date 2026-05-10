import type { UUID } from "crypto";

export interface ImageHeader {
  totalSize: number;
}

export interface ImageContent {
  id: UUID;
  contentType: string;
  file: File;
  timestamp: Date;
}

export interface ImageInfo {
  header: ImageHeader;
  contents: ImageContent[];
}

export interface ImageThumbnailContent {
  id: UUID;
  contentType: string;
  thumbnailURL: string;
  timestamp: Date;
}

export interface ImageThumbnailInfo {
  header: ImageHeader;
  contents: ImageThumbnailContent[];
}
