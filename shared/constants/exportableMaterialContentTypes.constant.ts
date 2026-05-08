import {
  MaterialContentType,
  MaterialType,
} from "@shared/api/interfaces/enums";

export const ExportableMaterialContentTypes = {
  [MaterialType.Textbook]: [
    MaterialContentType.JSON,
    MaterialContentType.PDF,
    MaterialContentType.DOCX,
  ],
  [MaterialType.Notebook]: [
    MaterialContentType.Markdown,
    MaterialContentType.PlainText,
    MaterialContentType.HTML,
    MaterialContentType.JSON,
    MaterialContentType.PDF,
    MaterialContentType.DOCX,
  ],
} as const satisfies Record<MaterialType, readonly MaterialContentType[]>;
