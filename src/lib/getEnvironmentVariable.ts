export const getEnvironmentVariable = function (key: string): string {
  const value: string | undefined = process.env[key];
  if (typeof value === "undefined" || value === "") {
    throw new Error(`Environment variable "${key}" is not defined.`);
  }
  return value;
};
