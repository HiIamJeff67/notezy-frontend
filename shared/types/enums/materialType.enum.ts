/* ============================== MaterialContentType ============================== */

// the sub type to indicate the content type of material files
export enum MaterialContentType {
  Markdown = "text/plain",
  PlainText = "text/plain",
  HTML = "text/html",
  JSON = "application/json",
  PDF = "application/pdf",
  DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  PNG = "image/png",
  JPG = "image/jpg",
  JPEG = "image/jpeg",
  GIF = "image/gif",
  SVG = "image/svg+xml",
}

export const AllMaterialContentTypes = Object.values(MaterialContentType);

/* ============================== MaterialType ============================== */

export enum MaterialType {
  Textbook = "Textbook",
  Notebook = "Notebook",
  LearningCard = "LearningCard",
  Workflow = "Workflow",
}

export const AllMaterialTypes = Object.values(MaterialType);

export const MaterialTypeToAllowedMaterialContentTypes = {
  [MaterialType.Textbook]: [
    MaterialContentType.PlainText,
    MaterialContentType.HTML,
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
  [MaterialType.LearningCard]: [
    MaterialContentType.HTML,
    MaterialContentType.JSON,
  ],
  [MaterialType.Workflow]: [
    MaterialContentType.PNG,
    MaterialContentType.JPG,
    MaterialContentType.JPEG,
    MaterialContentType.SVG,
  ],
} as const satisfies Record<MaterialType, readonly MaterialContentType[]>;
