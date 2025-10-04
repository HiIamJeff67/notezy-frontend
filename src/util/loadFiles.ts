export const loadFileFromDownloadURL = async (
  downloadURL: string
): Promise<string> => {
  const response = await fetch(downloadURL);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const jsonContent = await response.json();
    return jsonContent;
  } else if (contentType?.includes("text/")) {
    const textContent = await response.text();
    return textContent;
  } else {
    throw new Error(`unsupported file type of ${contentType}`);
  }
};
