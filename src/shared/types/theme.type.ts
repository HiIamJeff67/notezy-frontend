import { DropdownOptionType } from "./dropdownOptionType.type";

export interface Theme extends DropdownOptionType {
  // id: string;
  // name: string;
  authorName: string;
  authorAvatarURL: string;
  version: string;
  downloadURL: string;
  isDefault: boolean; // if it is not default, then we need the client to download it using downloadURL
  isLoaded: boolean; // using by individual users
  updatedAt: Date;
  createdAt: Date;
}
