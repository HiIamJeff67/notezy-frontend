export type UUID = string & { readonly __brand: unique symbol };

// Check if the UUID type is a version 4 uuid
export function isValidUUID(value: string): value is UUID {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

// Convert the uuid string to version 4 uuid type
export function convertStringToUUID(uuidString: string): UUID {
  if (!isValidUUID(uuidString)) {
    throw new Error(`Invalid UUID format: ${uuidString}`);
  }
  return uuidString as UUID;
}

// Generate a new uuid
export function generateUUID(): UUID {
  return crypto.randomUUID() as UUID;
}
