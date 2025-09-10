export enum AccessControlPermission {
  Read = "Read",
  Write = "Write",
  Admin = "Admin",
}

export const AllAccessControlPermissions = Object.values(
  AccessControlPermission
);
