export const getAuthorization = (
  accessToken: string | undefined | null
): string | undefined => {
  if (!accessToken) return undefined;
  if (accessToken.replaceAll(" ", "") === "") return undefined;
  return "Bearer " + accessToken;
};
