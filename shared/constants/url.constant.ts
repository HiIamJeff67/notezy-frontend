import {
  APIDevelopmentVersion,
  APIProductionVersion,
  APITestVersion,
  WebDevelopmentVersion,
  WebTestVersion,
} from "./version.constants";

/* ============================== Backend API URL ============================== */

export const APIDevelopmentNamespace = "development";
export const APIProductionNamespace = "production";
export const APITestNamespace = "test";

export const APIGroupBase = "api";
export const APIDevelopmentBaseURL =
  APIGroupBase + "/" + APIDevelopmentNamespace + "/" + APIDevelopmentVersion;
export const APIProductionBaseURL =
  APIGroupBase + "/" + APIProductionNamespace + "/" + APIProductionVersion;
export const APITestBaseURL =
  APIGroupBase + "/" + APITestNamespace + "/" + APITestVersion;

export const CurrentAPIBaseURL = APIDevelopmentBaseURL;

export const APIURLPathDictionary = {
  static: {
    globalImages: {
      avatars: {
        first: "static/globalImages/avatars/1",
      },
    },
  },
  auth: {
    register: "auth/register",
    login: "auth/login",
    logout: "auth/logout",
    sendAuthCode: "auth/sendAuthCode",
    forgetPassword: "auth/forgetPassword",
  },
  user: {
    getUserData: "user/getUserData",
    getMe: "user/getMe",
    updateMe: "user/updateMe",
  },
  userInfo: {
    getMyInfo: "userInfo/getMyInfo",
    updateMyInfo: "userInfo/updateMyInfo",
  },
  shelf: {
    getMyShelfById: "shelf/getMyShelfById",
    createShelf: "shelf/createShelf",
    synchronizeShelves: "shelf/synchronizeShelves",
    restoreMyShelfById: "shelf/restoreMyShelfById",
    restoreMyShelvesByIds: "shelf/restoreMyShelvesByIds",
    deleteMyShelfById: "shelf/deleteMyShelfById",
    deleteMyShelvesByIds: "shelf/deleteMyShelvesByIds",
  },
  material: {
    getMyMaterialById: "material/getMyMaterialById",
    searchMyMaterialsByShelfId: "material/searchMyMaterialsByShelfId",
    createTextbookMaterial: "material/createTextbookMaterial",
    saveMyMaterialById: "material/saveMyMaterialById",
    moveMyMaterialById: "material/moveMyMaterialById",
    restoreMyMaterialById: "material/restoreMyMaterialById",
    restoreMyMaterialsByIds: "material/restoreMyMaterialsByIds",
    deleteMyMaterialById: "material/deleteMyMaterialById",
    deleteMyMaterialsByIds: "material/deleteMyMaterialsByIds",
  },
};

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
  },
  root: {
    documents: "documents",
    dashboard: "dashboard",
  },
};
