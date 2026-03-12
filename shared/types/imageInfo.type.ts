import { UUID } from "crypto";

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
  content: ImageContent[];
}
