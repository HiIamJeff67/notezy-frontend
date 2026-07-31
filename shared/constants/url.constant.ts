import type { UUID } from "crypto";
import { WebDevelopmentVersion, WebTestVersion } from "./version.constants";
/* ============================== Frontend Web URL ============================== */

export const WebDevelopmentNamespace = "development";
export const WebProductionNamespace = ""; // leave this empty for the clean web url of frontend
export const WebTestNamespace = "test";

export const WebDevelopmentBaseURL =
  WebDevelopmentNamespace + "/" + WebDevelopmentVersion;
export const WebProductionBaseURL = ""; // leave this empty for the clean web url of frontend
export const WebTestBaseURL = WebTestNamespace + "/" + WebTestVersion;

export const CurrentWebBaseURL = WebDevelopmentBaseURL;

export const WebURLPathDictionary = {
  home: "",
  auth: {
    register: "register",
    login: "login",
    forgetPassword: "forgetPassword",
    redirect: {
      error: (title?: string, description?: string) =>
        `redirect/error?title=${title}&description=${description}`,
      google: "redirect/google",
      meta: "redirect/meta",
    },
  },
  oauth: {
    // the url to start the oauth services
    google: (qs: string) => {
      return `https://accounts.google.com/o/oauth2/v2/auth?${qs}`;
    },
    x: (qs: string) => {
      return `https://x.com/i/oauth2/authorize?${qs}`;
    },
  },
  root: {
    materialViewer: {
      _: "material-viewer",
      byId: (materialId: UUID, parentSubShelfId: UUID, rootShelfId: UUID) =>
        `material-viewer/${materialId}?parentSubShelfId=${parentSubShelfId}&rootShelfId=${rootShelfId}`,
      notFound: "material-viewer/not-found",
    },
    blockPackEditor: {
      index: "block-pack-editor",
      _: (blockPackId: UUID, parentSubShelfId: UUID, rootShelfId: UUID) =>
        `block-pack-editor/${blockPackId}?parentSubShelfId=${parentSubShelfId}&rootShelfId=${rootShelfId}`,
    },
    document: "document",
    introduction: "introduction",
    dashboard: {
      _: "dashboard",
    },
    trash: "trash",
    routines: {
      _: "routines",
      byStationId: (stationId: UUID) => `routines/${stationId}`,
    },
    setting: {
      account: "setting/account",
      preferences: "setting/preferences",
    },
  },
};
