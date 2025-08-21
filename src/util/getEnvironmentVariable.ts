export function getEnvironmentVariable(key: string): string {
  const value = (process.env as any)[key];
  if (typeof value === "undefined" || value === "") {
    throw new Error(`Environment variable "${key}" is not defined.`);
  }
  return value;
}
