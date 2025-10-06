/* ============================== MaterialContentType ============================== */

// the sub type to indicate the content type of material files
export enum MaterialContentType {
  PlainText = "text/plain",
  HTML = "text/html",
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

export const MaterialTypeToAllowedMaterialContentTypes: Record<
  MaterialType,
  MaterialContentType[]
> = {
  [MaterialType.Textbook]: [
    MaterialContentType.PlainText,
    MaterialContentType.HTML,
  ],
  [MaterialType.Notebook]: [MaterialContentType.PlainText],
  [MaterialType.LearningCard]: [MaterialContentType.HTML],
  [MaterialType.Workflow]: [
    MaterialContentType.PNG,
    MaterialContentType.JPG,
    MaterialContentType.JPEG,
    MaterialContentType.SVG,
  ],
};
