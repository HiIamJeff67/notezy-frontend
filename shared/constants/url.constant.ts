import type { UUID } from "crypto";
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
    createRootShelves: "rootShelf/createRootShelves",
    updateMyRootShelfById: "rootShelf/updateMyRootShelfById",
    updateMyRootShelvesByIds: "rootShelf/updateMyRootShelvesByIds",
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
    createSubShelvesByRootShelfIds: "subShelf/createSubShelvesByRootShelfIds",
    updateMySubShelfById: "subShelf/updateMySubShelfById",
    updateMySubShelvesByIds: "subShelf/updateMySubShelvesByIds",
    moveMySubShelf: "subShelf/moveMySubShelf",
    moveMySubShelvesByRootShelfId: "subShelf/moveMySubShelvesByRootShelfId",
    moveMySubShelvesByRootShelfIds: "subShelf/moveMySubShelvesByRootShelfIds",
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
    createMyMaterial: "material/createMyMaterial",
    updateMyMaterialById: "material/updateMyMaterialById",
    saveMyMaterialById: "material/saveMyMaterialById",
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
    getMyBlockPacksByParentSubShelfId:
      "blockPack/getMyBlockPacksByParentSubShelfId",
    getAllMyBlockPacksByRootShelfId:
      "blockPack/getAllMyBlockPacksByRootShelfId",
    createBlockPack: "blockPack/createBlockPack",
    createBlockPacks: "blockPack/createBlockPacks",
    updateMyBlockPackById: "blockPack/updateMyBlockPackById",
    updateMyBlockPacksByIds: "blockPack/updateMyBlockPacksByIds",
    moveMyBlockPackById: "blockPack/moveMyBlockPackById",
    moveMyBlockPacksByParentSubShelfId:
      "blockPack/moveMyBlockPacksByParentSubShelfId",
    moveMyBlockPacksByParentSubShelfIds:
      "blockPack/moveMyBlockPacksByParentSubShelfIds",
    restoreMyBlockPackById: "blockPack/restoreMyBlockPackById",
    restoreMyBlockPacksByIds: "blockPack/restoreMyBlockPacksByIds",
    deleteMyBlockPackById: "blockPack/deleteMyBlockPackById",
    deleteMyBlockPacksByIds: "blockPack/deleteMyBlockPacksByIds",
  },
  block: {
    getMyBlockById: "block/getMyBlockById",
    getMyBlocksByIds: "block/getMyBlocksByIds",
    getMyBlocksByBlockPackId: "block/getMyBlocksByBlockPackId",
    getAllMyBlocks: "block/getAllMyBlocks",
    appendBlock: "block/appendBlock",
    appendBlocks: "block/appendBlocks",
    insertBlock: "block/insertBlock",
    insertBlocks: "block/insertBlocks",
    updateMyBlockById: "block/updateMyBlockById",
    updateMyBlocksByIds: "block/updateMyBlocksByIds",
    restoreMyBlockById: "block/restoreMyBlockById",
    restoreMyBlocksByIds: "block/restoreMyBlocksByIds",
    deleteMyBlockById: "block/deleteMyBlockById",
    deleteMyBlocksByIds: "block/deleteMyBlocksByIds",
  },
  station: {
    visualizeMyTotalCount: "station/visualizeMyTotalCount",
    getMyStationById: "station/getMyStationById",
    getAllMyStations: "station/getAllMyStations",
    createStation: "station/createStation",
    createStations: "station/createStations",
    updateMyStationById: "station/updateMyStationById",
    updateMyStationsByIds: "station/updateMyStationsByIds",
    restoreMyStationById: "station/restoreMyStationById",
    restoreMyStationsByIds: "station/restoreMyStationsByIds",
    deleteMyStationById: "station/deleteMyStationById",
    deleteMyStationsByIds: "station/deleteMyStationsByIds",
    hardDeleteMyStationById: "station/hardDeleteMyStationById",
    hardDeleteMyStationsByIds: "station/hardDeleteMyStationsByIds",
  },
  routine: {
    visualizeMyRoutineStatusCount: "routine/visualizeMyRoutineStatusCount",
    visualizeMyRoutinePeriodCount: "routine/visualizeMyRoutinePeriodCount",
    visualizeMyRoutineScheduledStartAtCount:
      "routine/visualizeMyRoutineScheduledStartAtCount",
    visualizeMyRoutineScheduledEndAtCount:
      "routine/visualizeMyRoutineScheduledEndAtCount",
    getMyRoutineById: "routine/getMyRoutineById",
    getMyRoutinesByStationId: "routine/getMyRoutinesByStationId",
    getAllMyRoutinesByTimeRange: "routine/getAllMyRoutinesByTimeRange",
    createRoutineByStationId: "routine/createRoutineByStationId",
    createRoutinesByStationIds: "routine/createRoutinesByStationIds",
    updateMyRoutineById: "routine/updateMyRoutineById",
    updateMyRoutinesByIds: "routine/updateMyRoutinesByIds",
    linkRoutineTagById: "routine/linkRoutineTagById",
    linkRoutineTagsByIds: "routine/linkRoutineTagsByIds",
    linkRoutineTaskById: "routine/linkRoutineTaskById",
    linkRoutineTasksByIds: "routine/linkRoutineTasksByIds",
    linkRoutineItemById: "routine/linkRoutineItemById",
    linkRoutineItemsByIds: "routine/linkRoutineItemsByIds",
    restoreMyRoutineById: "routine/restoreMyRoutineById",
    restoreMyRoutinesByIds: "routine/restoreMyRoutinesByIds",
    deleteMyRoutineById: "routine/deleteMyRoutineById",
    deleteMyRoutinesByIds: "routine/deleteMyRoutinesByIds",
    hardDeleteMyRoutineById: "routine/hardDeleteMyRoutineById",
    hardDeleteMyRoutinesByIds: "routine/hardDeleteMyRoutinesByIds",
  },
  routineTag: {
    getMyRoutineTagById: "routineTag/getMyRoutineTagById",
    getAllMyRoutineTags: "routineTag/getAllMyRoutineTags",
    createRoutineTag: "routineTag/createRoutineTag",
    createRoutineTags: "routineTag/createRoutineTags",
    updateMyRoutineTagById: "routineTag/updateMyRoutineTagById",
    updateMyRoutineTagsByIds: "routineTag/updateMyRoutineTagsByIds",
    hardDeleteMyRoutineTagById: "routineTag/hardDeleteMyRoutineTagById",
    hardDeleteMyRoutineTagsByIds: "routineTag/hardDeleteMyRoutineTagsByIds",
  },
  routineTask: {
    visualizeMyRoutineTaskStatusCount:
      "routineTask/visualizeMyRoutineTaskStatusCount",
    visualizeMyRoutineTaskPurposeCount:
      "routineTask/visualizeMyRoutineTaskPurposeCount",
    visualizeMyRoutineTaskScheduledAtCount:
      "routineTask/visualizeMyRoutineTaskScheduledAtCount",
    visualizeMyRoutineTaskActualStartedAtCount:
      "routineTask/visualizeMyRoutineTaskActualStartedAtCount",
    visualizeMyRoutineTaskActualEndedAtCount:
      "routineTask/visualizeMyRoutineTaskActualEndedAtCount",
    getMyRoutineTaskById: "routineTask/getMyRoutineTaskById",
    getAllMyRoutineTasksByRoutineIds:
      "routineTask/getAllMyRoutineTasksByRoutineIds",
    getAllMyRoutineTasks: "routineTask/getAllMyRoutineTasks",
    createRoutineTaskByRoutineId: "routineTask/createRoutineTaskByRoutineId",
    updateMyRoutineTaskById: "routineTask/updateMyRoutineTaskById",
    pauseMyRoutineTaskById: "routineTask/pauseMyRoutineTaskById",
    resumeMyRoutineTaskById: "routineTask/resumeMyRoutineTaskById",
    hardDeleteMyRoutineTaskById: "routineTask/hardDeleteMyRoutineTaskById",
    hardDeleteMyRoutineTasksByIds: "routineTask/hardDeleteMyRoutineTasksByIds",
  },
  routineTaskRecord: {
    visualizeMyRoutineTaskRecordStatusCount:
      "routineTaskRecord/visualizeMyRoutineTaskRecordStatusCount",
    visualizeMyRoutineTaskRecordPurposeCount:
      "routineTaskRecord/visualizeMyRoutineTaskRecordPurposeCount",
    visualizeMyRoutineTaskRecordScheduledAtCount:
      "routineTaskRecord/visualizeMyRoutineTaskRecordScheduledAtCount",
    visualizeMyRoutineTaskRecordActualStartedAtCount:
      "routineTaskRecord/visualizeMyRoutineTaskRecordActualStartedAtCount",
    visualizeMyRoutineTaskRecordActualEndedAtCount:
      "routineTaskRecord/visualizeMyRoutineTaskRecordActualEndedAtCount",
    getAllMyRoutineTaskRecordsByRoutineTaskId:
      "routineTaskRecord/getAllMyRoutineTaskRecordsByRoutineTaskId",
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
    materialViewer: {
      _: "material-viewer",
      byId: (materialId: UUID, parentSubShelfId: UUID, rootShelfId: UUID) =>
        `material-viewer/${materialId}?parentSubShelfId=${parentSubShelfId}&rootShelfId=${rootShelfId}`,
      notFound: "material-viewer/not-found",
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
    routines: {
      _: "routines",
      byStationId: (stationId: UUID) => `routines/${stationId}`,
    },
  },
};
