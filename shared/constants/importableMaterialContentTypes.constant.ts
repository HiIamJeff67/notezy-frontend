import {
  MaterialContentType,
  MaterialType,
} from "@shared/api/interfaces/enums";

export const ImportableMaterialContentTypes = {
  [MaterialType.Textbook]: [MaterialContentType.PDF],
  [MaterialType.Notebook]: [
    MaterialContentType.Markdown,
    MaterialContentType.PlainText,
    MaterialContentType.HTML,
    MaterialContentType.JSON,
  ],
};
