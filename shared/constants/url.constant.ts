import { UUID } from "crypto";
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
    registerViaGoogle: "auth/registerViaGoogle",
    login: "auth/login",
    loginViaGoogle: "auth/loginViaGoogle",
    logout: "auth/logout",
    sendAuthCode: "auth/sendAuthCode",
    validateEmail: "auth/validateEmail",
    resetEmail: "auth/resetEmail",
    forgetPassword: "auth/forgetPassword",
    resetMe: "auth/resetMe",
    deleteMe: "auth/deleteMe",
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
  userAccount: {
    getMyAccount: "userAccount/getMyAccount",
    updatedMyAccount: "userAccount/updateMyAccount",
    bindGoogleAccount: "userAccount/bindGoogleAccount",
    unbindGoogleAccount: "userAccount/unbindGoogleAccount",
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
    getMySubShelvesAndItemsByPrevSubShelfId:
      "subShelf/getMySubShelvesAndItemsByPrevSubShelfId",
    createSubShelfByRootShelfId: "subShelf/createSubShelfByRootShelfId",
    updateMySubShelfById: "subShelf/updateMySubShelfById",
    moveMySubShelf: "subShelf/moveMySubShelf",
    moveMySubShelves: "subShelf/moveMySubShelves",
    restoreMySubShelfById: "subShelf/restoreMySubShelfById",
    restoreMySubShelvesByIds: "subShelf/restoreMySubShelvesByIds",
    deleteMySubShelfById: "subShelf/deleteMySubShelfById",
    deleteMySubShelvesByIds: "subShelf/deleteMySubShelvesByIds",
  },
  material: {
    getMyMaterialById: "material/getMyMaterialById",
    getMyMaterialAndItsParentById: "material/getMyMaterialAndItsParentById",
    getMyMaterialsByParentSubShelfId:
      "material/getMyMaterialsByParentSubShelfId",
    getAllMyMaterialsByRootShelfId: "material/getAllMyMaterialsByRootShelfId",
    createTextbookMaterial: "material/createTextbookMaterial",
    createNotebookMaterial: "material/createNotebookMaterial",
    updateMyMaterialById: "material/updateMyMaterialById",
    saveMyNotebookMaterialById: "material/saveMyNotebookMaterialById",
    moveMyMaterialById: "material/moveMyMaterialById",
    moveMyMaterialsByIds: "material/moveMyMaterialsByIds",
    restoreMyMaterialById: "material/restoreMyMaterialById",
    restoreMyMaterialsByIds: "material/restoreMyMaterialsByIds",
    deleteMyMaterialById: "material/deleteMyMaterialById",
    deleteMyMaterialsByIds: "material/deleteMyMaterialsByIds",
  },
  blockPack: {
    getMyBlockPackById: "blockPack/getMyBlockPackById",
    getMyBlockPackAndItsParentById: "blockPack/getMyBlockPackAndItsParentById",
    getMyBlockPackAndItsBlockGroupsAndTheirBlocksById:
      "blockPack/getMyBlockPackAndItsBlockGroupsAndTheirBlocksById",
    getMyBlockPacksByParentSubShelfId:
      "blockPack/getMyBlockPacksByParentSubShelfId",
    getAllMyBlockPacksByRootShelfId:
      "blockPack/getAllMyBlockPacksByRootShelfId",
    createBlockPack: "blockPack/createBlockPack",
    updateMyBlockPackById: "blockPack/updateMyBlockPackById",
    moveMyBlockPackById: "blockPack/moveMyBlockPackById",
    moveMyBlockPacksByIds: "blockPack/moveMyBlockPacksByIds",
    restoreMyBlockPackById: "blockPack/restoreMyBlockPackById",
    restoreMyBlockPacksByIds: "blockPack/restoreMyBlockPacksByIds",
    deleteMyBlockPackById: "blockPack/deleteMyBlockPackById",
    deleteMyBlockPacksByIds: "blockPack/deleteMyBlockPacksByIds",
  },
  blockGroup: {
    getMyBlockGroupById: "blockGroup/getMyBlockGroupById",
    getMyBlockGroupAndItsBlocksById:
      "blockGroup/getMyBlockGroupAndItsBlocksById",
    getMyBlockGroupsAndTheirBlocksByIds:
      "blockGroup/getMyBlockGroupsAndTheirBlocksByIds",
    getMyBlockGroupsAndTheirBlocksByBlockPackId:
      "blockGroup/getMyBlockGroupsAndTheirBlocksByBlockPackId",
    getMyBlockGroupsByPrevBlockGroupId:
      "blockGroup/getMyBlockGroupsByPrevBlockGroupId",
    getAllMyBlockGroupsByBlockPackId:
      "blockGroup/getAllMyBlockGroupsByBlockPackId",
    insertBlockGroupByBlockPackId: "blockGroup/insertBlockGroupByBlockPackId",
    insertBlockGroupAndItsBlocksByBlockPackId:
      "blockGroup/insertBlockGroupAndItsBlocksByBlockPackId",
    insertBlockGroupsAndTheirBlocksByBlockPackId:
      "blockGroup/insertBlockGroupsAndTheirBlocksByBlockPackId",
    insertSequentialBlockGroupsAndTheirBlocksByBlockPackId:
      "blockGroup/insertSequentialBlockGroupsAndTheirBlocksByBlockPackId",
    moveMyBlockGroupsByIds: "blockGroup/moveMyBlockGroupsByIds",
    restoreMyBlockGroupById: "blockGroup/restoreMyBlockGroupById",
    restoreMyBlockGroupsByIds: "blockGroup/restoreMyBlockGroupsByIds",
    deleteMyBlockGroupById: "blockGroup/deleteMyBlockGroupById",
    deleteMyBlockGroupsByIds: "blockGroup/deleteMyBlockGroupsByIds",
  },
  block: {
    getMyBlockById: "block/getMyBlockById",
    getMyBlocksByIds: "block/getMyBlocksByIds",
    getMyBlocksByBlockGroupId: "block/getMyBlocksByBlockGroupId",
    getMyBlocksByBlockGroupIds: "block/getMyBlocksByBlockGroupIds",
    getMyBlocksByBlockPackId: "block/getMyBlocksByBlockPackId",
    getAllMyBlocks: "block/getAllMyBlocks",
    insertBlock: "block/insertBlock",
    insertBlocks: "block/insertBlocks",
    updateMyBlockById: "block/updateMyBlockById",
    updateMyBlocksByIds: "block/updateMyBlocksByIds",
    restoreMyBlockById: "block/restoreMyBlockById",
    restoreMyBlocksByIds: "block/restoreMyBlocksByIds",
    deleteMyBlockById: "block/deleteMyBlockById",
    deleteMyBlocksByIds: "block/deleteMyBlocksByIds",
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
    materialEditor: {
      _: "material-editor",
      notebook: (materialId: UUID, parentSubShelfId: UUID, rootShelfId: UUID) =>
        `material-editor/notebook/${materialId}?parentSubShelfId=${parentSubShelfId}&rootShelfId=${rootShelfId}`,
      textbook: (materialId: UUID, parentSubShelfId: UUID, rootShelfId: UUID) =>
        `material-editor/textbook/${materialId}?parentSubShelfId=${parentSubShelfId}&rootShelfId=${rootShelfId}`,
      notFound: "material-editor/not-found",
    },
    blockPackEditor: {
      _: (blockPackId: UUID, parentSubShelfId: UUID, rootShelfId: UUID) =>
        `block-pack-editor/${blockPackId}?parentSubShelfId=${parentSubShelfId}&rootShelfId=${rootShelfId}`,
    },
    documents: {
      _: "documents",
    },
    dashboard: {
      _: "dashboard",
    },
  },
};
