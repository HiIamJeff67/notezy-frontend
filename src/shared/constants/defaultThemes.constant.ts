import { Theme } from "../types/theme.type";

// our default theme is dark
export const DefaultDarkTheme: Theme = {
  id: "ae29bb37-d4ba-4826-bf56-9074e23ea65b",
  name: "Default Dark",
  authorName: "Notezy Team",
  authorAvatarURL: "", // place Notezy brand Icon here
  version: "v1",
  downloadURL: "",
  isDefault: true,
  isLoaded: true,
  updatedAt: new Date("2025-06-09T08:26:27.347Z"),
  createdAt: new Date("2025-06-09T08:26:27.347Z"),
};

export const DefaultLightTheme: Theme = {
  id: "9663dc5f-1980-4ca4-b1e5-54c63dcd3ff8",
  name: "Default Light",
  authorName: "Notezy Team",
  authorAvatarURL: "", // place Notezy brand Icon here
  version: "v1",
  downloadURL: "",
  isDefault: true,
  isLoaded: false,
  updatedAt: new Date("2025-06-09T08:26:27.347Z"),
  createdAt: new Date("2025-06-09T08:26:27.347Z"),
};

export const DefaultNeonTheme: Theme = {
  id: "a9fc704e-f3c8-47ad-b761-967def87d2db",
  name: "Default Neon",
  authorName: "Notezy Team",
  authorAvatarURL: "", // place Notezy brand Icon here
  version: "v1",
  downloadURL: "",
  isDefault: true,
  isLoaded: false,
  updatedAt: new Date("2025-06-09T08:26:27.347Z"),
  createdAt: new Date("2025-06-09T08:26:27.347Z"),
};

export const DefaultOceanTheme: Theme = {
  id: "d8aa6503-8449-46fb-8528-9a18782a630a",
  name: "Default Ocean",
  authorName: "Notezy Team",
  authorAvatarURL: "", // place Notezy brand Icon here
  version: "v1",
  downloadURL: "",
  isDefault: true,
  isLoaded: false,
  updatedAt: new Date("2025-06-09T08:26:27.347Z"),
  createdAt: new Date("2025-06-09T08:26:27.347Z"),
};

export const DefaultStandardTheme: Theme = {
  id: "2a377bf8-6101-4237-9293-e23594529cdd",
  name: "Default Standard",
  authorName: "Notezy Team",
  authorAvatarURL: "", // place Notezy brand Icon here
  version: "v1",
  downloadURL: "",
  isDefault: true,
  isLoaded: false,
  updatedAt: new Date("2025-06-09T08:26:27.347Z"),
  createdAt: new Date("2025-06-09T08:26:27.347Z"),
};

// only setup the default themes here for initial use,
// if more themes are required, the user can view the theme store
// and add the themes from it by using useThemeStore.addTheme()
// with passing a theme data which is extracted from the database(see the backend)
export const DefaultThemes = [
  DefaultDarkTheme,
  DefaultLightTheme,
  DefaultNeonTheme,
  DefaultOceanTheme,
  DefaultStandardTheme,
];
