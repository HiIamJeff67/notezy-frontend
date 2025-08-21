import type { NextConfig } from "next";
import { CurrentWebBaseURL } from "./shared/constants";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: "/" + CurrentWebBaseURL,
};

export default nextConfig;
