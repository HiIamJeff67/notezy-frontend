import type { NextConfig } from "next";
import { CurrentWebBaseURL } from "./shared/constants/url.constant";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: "/" + CurrentWebBaseURL,
};

export default nextConfig;
