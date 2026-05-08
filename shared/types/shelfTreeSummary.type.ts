// This shelf summary structure maybe different from the backend,

import { AnalysisStatus } from "@shared/enums";
import { RootShelfNode } from "@shared/types/shelfNodes.type";

// Since we may require more information for the client user
export interface ShelfTreeSummary {
  root: RootShelfNode;
  estimatedByteSize: number;
  maxWidth: number;
  maxDepth: number;
  hasChanged: boolean;
  analysisStatus: AnalysisStatus;
}
