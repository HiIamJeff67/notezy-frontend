// This shelf summary structure maybe different from the backend,

import { AnalysisStatus } from "./enums/analysisStatus.enum";
import { RootShelfNode } from "./shelfMaterialNodes";

// Since we may require more information for the client user
export interface ShelfTreeSummary {
  root: RootShelfNode;
  estimatedByteSize: number;
  maxWidth: number;
  maxDepth: number;
  hasChanged: boolean;
  analysisStatus: AnalysisStatus;
}
