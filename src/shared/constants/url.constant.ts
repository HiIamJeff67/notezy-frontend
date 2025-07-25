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
  auth: {
    register: "auth/register",
    login: "auth/login",
    logout: "auth/logout",
  },
  user: {
    getMe: "user/getMe",
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
  register: "register",
  login: "login",
  documents: "documents",
  dashboard: "dashboard",
};
