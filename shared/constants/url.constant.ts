import { UUID } from "crypto";
import { MaterialType } from "../types/enums";
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
  rootShelf: {
    getMyRootShelfById: "rootShelf/getMyRootShelfById",
    searchRecentRootShelves: "rootShelf/searchRecentRootShelves",
    createRootShelf: "rootShelf/createRootShelf",
    updateMyRootShelfById: "rootShelf/updateMyRootShelfById",
    restoreMyRootShelfById: "rootShelf/restoreMyRootShelfById",
    restoreMyRootShelvesByIds: "rootShelf/restoreMyRootShelvesByIds",
    deleteMyRootShelfById: "rootShelf/deleteMyRootShelfById",
    deleteMyRootShelvesByIds: "rootShelf/deleteMyRootShelvesByIds",
  },
  subShelf: {
    getMySubShelfById: "subShelf/getMySubShelfById",
    getMySubShelvesByPrevSubShelfId: "subShelf/getMySubShelvesByPrevSubShelfId",
    getAllMySubShelvesByRootShelfId: "subShelf/getAllMySubShelvesByRootShelfId",
    createSubShelfByRootShelfId: "subShelf/createSubShelfByRootShelfId",
    updateMySubShelfById: "subShelf/updateMySubShelfById",
    moveMySubShelf: "subShelf/moveMySubShelf",
    moveMySubShelves: "subShelf/moveMySubShelves",
    restoreMySubShelfById: "subShelf/restoreMySubShelfById",
    restoreMySubShelvesByIds: "subShelf/restoreMySubShelvesByIds",
    deleteMySubShelfById: "subShelf/deleteMySubShelfById",
    deleteMySubShelvesByIds: "subShelf/deleteMySubShelvesByIds",
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
    getAllMyMaterialsByParentSubShelfId:
      "material/getAllMyMaterialsByParentSubShelfId",
    getAllMyMaterialsByRootShelfId: "material/getAllMyMaterialsByRootShelfId",
    createNotebookMaterial: "material/createNotebookMaterial",
    updateMyNotebookMaterialById: "material/updateMyNotebookMaterialById",
    saveMyNotebookMaterialById: "material/saveMyNotebookMaterialById",
    moveMyMaterialById: "material/moveMyMaterialById",
    moveMyMaterialsByIds: "material/moveMyMaterialsByIds",
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
    materialEditor: {
      notebook: (materialId: UUID, parentSubShelfId: UUID) =>
        `material-editor/${materialId}?parentSubShelfId=${parentSubShelfId}&type=${MaterialType.Notebook}`,
      textbook: (materialId: UUID, parentSubShelfId: UUID) =>
        `material-editor/${materialId}?parentSubShelfId=${parentSubShelfId}&type=${MaterialType.Textbook}`,
      notFound: "material-editor/not-found",
    },
    documents: "documents",
    dashboard: "dashboard",
  },
};
