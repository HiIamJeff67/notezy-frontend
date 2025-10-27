import { loadFileFromDownloadURL } from "@/util/loadFiles";
import { choiceRandom } from "@/util/random";
import { PartialBlock } from "@blocknote/core";

export class MaterialLoader {
  public static async loadMaterialContent(
    downloadURL: string,
    fallback: PartialBlock[][]
  ): Promise<PartialBlock[] | undefined> {
    const fileContentString = await loadFileFromDownloadURL(downloadURL);
    const parsedContent = (
      fileContentString && fileContentString.trim() !== ""
        ? JSON.parse(fileContentString)
        : choiceRandom(fallback)
    ) as PartialBlock[];
    if (!Array.isArray(parsedContent)) return undefined;

    return parsedContent;
  }
}
